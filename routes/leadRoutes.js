import express from "express";
import Lead from "../models/Lead.js";

const router = express.Router();

// Create a new lead
router.post("/", async (req, res) => {
    try {
        const lead = new Lead(req.body);
        const savedLead = await lead.save();
        res.status(201).json(savedLead);
    } catch (error) {
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
        const lead = await Lead.findById(req.params.id);
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
        const updatedLead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedLead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        res.json(updatedLead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a lead
router.delete("/:id", async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        res.json({ message: "Lead deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
