import mongoose from "mongoose";

const SubSourceSchema = new mongoose.Schema({
  uuid: { type: String },
  subSourceName: { type: String, required: true },
  project: {
    projectId: { type: String },
  },
});

const SourceConfigSchema = new mongoose.Schema({
  uuid: { type: String },
  sourceName: { type: String, required: true },
  subSources: [SubSourceSchema],
});

const CampaignSchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      required: true,
      trim: true,
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
