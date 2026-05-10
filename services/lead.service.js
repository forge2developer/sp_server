import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Get All Leads ─────────────────────────────────────────────────────────────
export const getAllLeads = async () => {
    // Use raw collection if needed, but Mongoose model should be fine for basic fetch
    const leads = await Lead.find().sort({ createdAt: -1 });
    
    return leads.map(l => ({
        _id: l._id?.toString() || "",
        name: l.name || "",
        email: l.email || "",
        phone: l.phone || "",

        status: l.status || "New",
        value: l.value || 0,
        assignedTo: l.assignedTo || "Unassigned",
        assignedUserId: l.assignedUserId?.toString() || "",
        createdAt: l.createdAt || new Date(),
        updatedAt: l.updatedAt || new Date(),
        project_ids: l.project_ids || [],
        campaign_responses: l.campaign_responses || []
    }));
};

// ─── Get Lead by ID ────────────────────────────────────────────────────────────
export const getLeadById = async (id) => {
    let lead = await Lead.findById(id);

    // Handle potential string vs ObjectId vs UUID mismatches
    if (!lead && mongoose.Types.ObjectId.isValid(id)) {
        lead = await Lead.findOne({ _id: new mongoose.Types.ObjectId(id) });
    }

    if (!lead) throw new AppError("Lead not found", 404);

    return {
        _id: lead._id?.toString() || "",
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",

        status: lead.status || "New",
        value: lead.value || 0,
        assignedTo: lead.assignedTo || "Unassigned",
        assignedUserId: lead.assignedUserId?.toString() || "",
        createdAt: lead.createdAt || new Date(),
        updatedAt: lead.updatedAt || new Date(),
        project_ids: lead.project_ids || [],
        campaign_responses: lead.campaign_responses || []
    };
};

// ─── Get Lead Activities ────────────────────────────────────────────────────────
export const getLeadActivities = async (leadId) => {
    const col = mongoose.connection.collection("leadactivities");
    
    // Find lead first to get correct ID type
    const lead = await getLeadById(leadId);
    if (!lead) throw new AppError("Lead not found", 404);

    // Search activities by lead_id (matching the type used in the lead document)
    // The Lead model uses crypto.randomUUID() for _id, which is stored as Mixed.
    // We try to match the exact ID value.
    const activities = await mongoose.connection.collection("leadactivities")
        .find({ lead_id: lead._id })
        .sort({ createdAt: -1 })
        .toArray();
    
    return activities.map(a => ({
        _id: a._id?.toString() || "",
        stage: a.stage || "", // Maps to 'type' in frontend
        updates: a.updates || "", // Maps to 'content' in frontend
        notes: a.notes || "",
        user_name: a.user_name || "System",
        createdAt: a.createdAt || new Date()
    }));
};
