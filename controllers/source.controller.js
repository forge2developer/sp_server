import { sourceService } from "../services/source.service.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getSources = asyncHandler(async (req, res) => {
  const sources = await sourceService.getAllSources();
  res.status(200).json({
    success: true,
    count: sources.length,
    data: sources,
  });
});

export const seedSources = asyncHandler(async (req, res) => {
  const result = await sourceService.seedSources();
  res.status(200).json({
    success: true,
    ...result,
  });
});
