import mongoose from "mongoose";
import { sourceService } from "../services/source.service.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    
    // Auto-seed default sources
    await sourceService.seedSources();
    console.log("Default Sources Seeded");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;