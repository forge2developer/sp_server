import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Lead name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
            default: "New",
        },
        source: {
            type: String,
            default: "Direct",
        },
        value: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
        },
        assignedTo: {
            type: String, // Can be refined to a User reference later
            default: "Unassigned",
        },
    },
    {
        timestamps: true,
    }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
