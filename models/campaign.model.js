import mongoose from "mongoose";
import crypto from "crypto";

const SubSourceSchema = new mongoose.Schema({
  uuid: { 
    type: String,
    default: () => crypto.randomUUID()
  },
  subSourceName: { type: String, required: true },
  project: {
    projectId: { type: String },
  },
});

const SourceConfigSchema = new mongoose.Schema({
  uuid: { 
    type: String,
    default: () => crypto.randomUUID()
  },
  sourceName: { type: String, required: true },
  subSources: [SubSourceSchema],
});

const CampaignSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      projectId: { type: String },
    },
    sources: [SourceConfigSchema],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Campaign = mongoose.model("Campaign", CampaignSchema);

export default Campaign;
