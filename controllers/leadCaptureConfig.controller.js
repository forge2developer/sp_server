import * as configService from "../services/leadCaptureConfig.service.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── GET /api/lead-capture-configs ─────────────────────────────────────────────
export const getConfigs = asyncHandler(async (req, res) => {
  const { organization } = req.query;
  const configs = await configService.getAllConfigs(organization);
  res.status(200).json({
    success: true,
    count: configs.length,
    data: configs,
  });
});

// ─── GET /api/lead-capture-configs/:id ─────────────────────────────────────────
export const getConfig = asyncHandler(async (req, res) => {
  const config = await configService.getConfigById(req.params.id);
  res.status(200).json({
    success: true,
    data: config,
  });
});

// ─── POST /api/lead-capture-configs ────────────────────────────────────────────
export const createConfig = asyncHandler(async (req, res) => {
  const config = await configService.createConfig(req.body);
  res.status(201).json({
    success: true,
    message: "Configuration created successfully",
    data: config,
  });
});

// ─── PUT /api/lead-capture-configs/:id ─────────────────────────────────────────
export const updateConfig = asyncHandler(async (req, res) => {
  const config = await configService.updateConfig(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Configuration updated successfully",
    data: config,
  });
});

// ─── DELETE /api/lead-capture-configs/:id ──────────────────────────────────────
export const deleteConfig = asyncHandler(async (req, res) => {
  await configService.deleteConfig(req.params.id);
  res.status(200).json({
    success: true,
    message: "Configuration deleted successfully",
  });
});
