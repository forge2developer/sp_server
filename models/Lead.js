import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
    {
        organization: {
            type: String,
            trim: true,
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
        source: {
            type: String,
            default: "Direct",
        },
        sub_source: {
            type: String,
            trim: true,
        },
        campaign: {
            type: String,
            trim: true,
        },
        project_ids: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Project",
            default: [],
        },
        config_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeadCaptureConfig",
            default: null,
        },
        status: {
            type: String,
            enum: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
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
    },
    {
        timestamps: true,
        strict: false,
    }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
