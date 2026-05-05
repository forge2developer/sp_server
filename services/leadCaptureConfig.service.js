import LeadCaptureConfig from "../models/leadCaptureConfig.model.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Get All Configs ─────────────────────────────────────────────────────────────
export const getAllConfigs = async () => {
  return LeadCaptureConfig.find({})
    .populate("project_ids", "name product_id")
    .sort({ createdAt: -1 });
};

// ─── Get Config by ID ──────────────────────────────────────────────────────────
export const getConfigById = async (id) => {
  const config = await LeadCaptureConfig.findById(id).populate(
    "project_ids",
    "name product_id"
  );
  if (!config) throw new AppError("Configuration not found", 404);
  return config;
};

// ─── Create Config ─────────────────────────────────────────────────────────────
export const createConfig = async (data) => {
  const config = await LeadCaptureConfig.create(data);
  return config;
};

// ─── Update Config ─────────────────────────────────────────────────────────────
export const updateConfig = async (id, data) => {
  const config = await LeadCaptureConfig.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).populate("project_ids", "name product_id");

  if (!config) throw new AppError("Configuration not found", 404);
  return config;
};

// ─── Delete Config ─────────────────────────────────────────────────────────────
export const deleteConfig = async (id) => {
  const config = await LeadCaptureConfig.findByIdAndDelete(id);
  if (!config) throw new AppError("Configuration not found", 404);
  return config;
};
