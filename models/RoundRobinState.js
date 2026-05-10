import mongoose from "mongoose";

const roundRobinStateSchema = new mongoose.Schema(
  {
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

// Unique index on context
roundRobinStateSchema.index({ context: 1 }, { unique: true });

const RoundRobinState = mongoose.model("RoundRobinState", roundRobinStateSchema);

export default RoundRobinState;
