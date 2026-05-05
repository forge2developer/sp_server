import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const sourceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: [true, "Source name is required"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Source = mongoose.model("Source", sourceSchema);
export default Source;
