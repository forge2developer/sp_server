import * as campaignService from "../services/campaign.service.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getCampaigns = asyncHandler(async (req, res) => {
  const { organization } = req.query;
  const campaigns = await campaignService.getAllCampaigns(organization);
  res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
});

export const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id);
  res.status(200).json({ success: true, data: campaign });
});

export const createCampaign = asyncHandler(async (req, res) => {
  const campaign = await campaignService.createCampaign(req.body);
  res.status(201).json({ success: true, message: "Campaign created successfully", data: campaign });
});

export const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await campaignService.updateCampaign(req.params.id, req.body);
  res.status(200).json({ success: true, message: "Campaign updated successfully", data: campaign });
});

export const deleteCampaign = asyncHandler(async (req, res) => {
  await campaignService.deleteCampaign(req.params.id);
  res.status(200).json({ success: true, message: "Campaign deleted successfully" });
});
