import mongoose from "mongoose";

const LeadCaptureConfigSchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Form name is required"],
      trim: true,
    },
    source: {
      type: String,
      trim: true,
      default: "Manual",
    },
    campaign_name: {
      type: String,
      trim: true,
    },
    sub_source: {
      type: String,
      trim: true,
    },
    project_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    contact_info: {
      type: Object,
      default: {},
    },
    selected_fields: {
      type: [String],
      default: ["budget", "preferred_location", "preferred_floor", "interested_projects"],
    },
    manual_requirements: {
      type: [{ key: String, value: String }],
      default: [],
    },
    selected_contact_fields: {
      type: [String],
      default: ["email", "location"],
    },
    manual_contact_fields: {
      type: [{ key: String }],
      default: [],
    },
    assigned_people: {
      type: [
        {
          id: String,
          name: String,
          email: String,
          phone: String,
          role: String,
          category: String,
          type: String,
        },
      ],
      default: [],
    },
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

const LeadCaptureConfig = mongoose.model("LeadCaptureConfig", LeadCaptureConfigSchema);

export default LeadCaptureConfig;
