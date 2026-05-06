import mongoose from "mongoose";

const userAvailabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Available", "Busy", "On Leave"],
      default: "Available",
    },
    schedule: {
      Monday: { isWorking: { type: Boolean, default: true }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
      Tuesday: { isWorking: { type: Boolean, default: true }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
      Wednesday: { isWorking: { type: Boolean, default: true }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
      Thursday: { isWorking: { type: Boolean, default: true }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
      Friday: { isWorking: { type: Boolean, default: true }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
      Saturday: { isWorking: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
      Sunday: { isWorking: { type: Boolean, default: false }, start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" } },
    },
  },
  {
    timestamps: true,
  }
);

const UserAvailability = mongoose.model("UserAvailability", userAvailabilitySchema);

export default UserAvailability;
