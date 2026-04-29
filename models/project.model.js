import mongoose from "mongoose";

// ─── Plot Schema (Sub-document) ─────────────────────────────────────────────
const PlotSchema = new mongoose.Schema(
  {
    plotId: { type: String, required: true },
    plotNumber: { type: String, required: true },
    size: { type: Number },
    facing: { type: String },
    isCorner: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["available", "booked", "sold"],
      default: "available",
    },
    price: { type: Number },
    bookedBy: {
      leadName: String,
      leadUuid: String,
      profileId: Number,
      phone: String,
      userId: String,
      userName: String,
      bookedAt: Date,
    },
  },
  { _id: false }
);

// ─── Phase Schema (like Block for apartments — groups plots) ────────────────
const PhaseSchema = new mongoose.Schema(
  {
    phaseId: { type: String, required: true },
    phaseName: { type: String, required: true },
    plots: [PlotSchema],
  },
  { _id: false }
);

// ─── Project Schema (Main Document) ─────────────────────────────────────────
const ProjectSchema = new mongoose.Schema(
  {
    product_id: { type: Number, required: true, unique: true },
    organization: { type: String, required: true, index: true },
    property: {
      type: String,
      default: "plots",
    },
    name: { type: String, required: true },
    location: { type: String },
    layoutImages: [String], // Up to 5 site layout images
    phases: [PhaseSchema], // Phase → Plots hierarchy
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

// Indexes
ProjectSchema.index({ organization: 1, product_id: 1 });
ProjectSchema.index({ organization: 1, name: 1 });

const Project = mongoose.model("Project", ProjectSchema);

export default Project;
