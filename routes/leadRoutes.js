import express from "express";
import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import LeadCaptureConfig from "../models/leadCaptureConfig.model.js";
import LeadActivity from "../models/LeadActivity.model.js";
import RoundRobinService from "../services/RoundRobinService.js";

const router = express.Router();

// Create a new lead
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/leads - Body:", JSON.stringify(req.body, null, 2));
    const { config_id, ...leadData } = req.body;
    let assignedTo = leadData.assignedTo || "Unassigned";
    let assignedUserId = null;

    let nextUser = null;

    // 1. Try assignment based on specific form config
    if (config_id) {
      let config = await LeadCaptureConfig.findById(config_id);
      if (!config && mongoose.Types.ObjectId.isValid(config_id)) {
        config = await LeadCaptureConfig.findOne({ _id: new mongoose.Types.ObjectId(config_id) });
      }
      
      if (config) {
        const candidateIds = config.assigned_people?.map(p => p.id).filter(id => !!id);
        nextUser = await RoundRobinService.getNextUser(
          leadData.organization || "SP_PROMOTERS",
          config_id,
          candidateIds
        );
      }
    }

    // 2. Fallback to Global Round-Robin if no user assigned yet
    if (!nextUser) {
      nextUser = await RoundRobinService.getNextUser(leadData.organization || "SP_PROMOTERS", "global");
    }

    if (nextUser) {
      assignedUserId = nextUser._id;
      assignedTo = nextUser.name || `${nextUser.profile?.firstName} ${nextUser.profile?.lastName}`;
    }

    const lead = new Lead({ 
      ...leadData, 
      assignedTo, 
      assignedUserId,
      source: leadData.source || "Direct"
    });
    
    const savedLead = await lead.save();

    // Initial activity log
    await LeadActivity.create({
      lead_id: savedLead._id,
      stage: "System",
      updates: `Lead created and assigned to ${assignedTo} via Round-Robin`,
      notes: "System generated"
    });

    res.status(201).json(savedLead);
  } catch (error) {
    console.error("Lead Creation Error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get all leads
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single lead by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let lead;
    
    // Try finding by string ID first (for new UUID-based leads)
    lead = await Lead.findById(id);
    
    // If not found and ID looks like a MongoDB ObjectId, try querying without the String casting
    if (!lead && mongoose.Types.ObjectId.isValid(id)) {
      lead = await Lead.findOne({ _id: new mongoose.Types.ObjectId(id) });
    }

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a lead
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let oldLead;
    
    // Find old lead
    oldLead = await Lead.findById(id);
    if (!oldLead && mongoose.Types.ObjectId.isValid(id)) {
      oldLead = await Lead.findOne({ _id: new mongoose.Types.ObjectId(id) });
    }

    if (!oldLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Update lead
    const updatedLead = await Lead.findOneAndUpdate(
      { _id: oldLead._id }, 
      req.body, 
      { new: true, runValidators: true }
    );

    // Log activity if status changed
    if (oldLead.status !== updatedLead.status) {
      await LeadActivity.create({
        lead_id: updatedLead._id,
        stage: "Status Change",
        updates: `Status changed from ${oldLead.status} to ${updatedLead.status}`,
        notes: "System generated",
      });
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get lead activities
router.get("/:id/activities", async (req, res) => {
  try {
    const { id } = req.params;
    let query = { lead_id: id };
    
    // If ID looks like a MongoDB ObjectId, allow querying both string and ObjectId versions
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { 
        $or: [
          { lead_id: id },
          { lead_id: new mongoose.Types.ObjectId(id) }
        ]
      };
    }
    
    const activities = await LeadActivity.find(query).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a lead
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let lead;

    // Find and delete
    lead = await Lead.findByIdAndDelete(id);
    if (!lead && mongoose.Types.ObjectId.isValid(id)) {
      lead = await Lead.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    }

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
