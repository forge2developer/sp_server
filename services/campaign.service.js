import Campaign from "../models/campaign.model.js";
import { AppError } from "../middleware/errorHandler.js";

export const getAllCampaigns = async (organization) => {
  return Campaign.find({ organization }).sort({ createdAt: -1 });
};

export const getCampaignById = async (id) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
};

export const createCampaign = async (data) => {
  return Campaign.create(data);
};

export const updateCampaign = async (id, data) => {
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
};

export const deleteCampaign = async (id) => {
  const campaign = await Campaign.findByIdAndDelete(id);
  if (!campaign) throw new AppError("Campaign not found", 404);
  return campaign;
};
