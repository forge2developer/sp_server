import mongoose from "mongoose";

const roundRobinStateSchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      required: true,
      default: "SP_PROMOTERS",
    },
    last_assigned_index: {
      type: Number,
      default: -1,
    },
    context: {
      type: String,
      required: true, // e.g., 'global', or a config_id
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on organization and context
roundRobinStateSchema.index({ organization: 1, context: 1 }, { unique: true });

const RoundRobinState = mongoose.model("RoundRobinState", roundRobinStateSchema);

export default RoundRobinState;
