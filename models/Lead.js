import mongoose from "mongoose";
import crypto from "crypto";

const leadSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.Mixed,
            default: () => crypto.randomUUID(),
        },
        name: {
            type: String,
            required: [true, "Lead name is required"],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },

        project_ids: {
            type: [String],
            ref: "Project",
            default: [],
        },
        config_id: {
            type: String,
            ref: "LeadCaptureConfig",
            default: null,
        },
        status: {
            type: String,
            enum: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost", "Re-engaged"],
            default: "New",
        },
        value: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
        },
        assignedTo: {
            type: String,
            default: "Unassigned",
        },
        requirement_data: {
            type: Map,
            of: String,
            default: {},
        },
        assignedUserId: {
            type: mongoose.Schema.Types.Mixed,
            ref: "User"
        },
        campaign_responses: [{
            campaign: String,
            source: String,
            sub_source: String,
            project: String,
            engagedAt: {
                type: Date,
                default: Date.now
            }
        }],
    },
    {
        timestamps: true,
        strict: false,
    }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
