import { projectService } from "../services/project.service.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── GET /api/projects ────────────────────────────────────────────────────────
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjects();
  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.status(200).json({
    success: true,
    data: project,
  });
});

// ─── POST /api/projects (with image upload via multer) ────────────────────────
export const createProject = asyncHandler(async (req, res) => {
  const tempFilePaths = req.files ? req.files.map((f) => f.path) : [];
  const project = await projectService.addProject(req.body, tempFilePaths);
  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
});

// ─── POST /api/projects/:id/book ──────────────────────────────────────────────
export const bookPlot = asyncHandler(async (req, res) => {
  const project = await projectService.bookPlot(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Plot booked successfully",
    data: project,
  });
});

// ─── POST /api/projects/:id/reverse-book ──────────────────────────────────────
export const reverseBooking = asyncHandler(async (req, res) => {
  const project = await projectService.reverseBooking(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Booking reversed successfully",
    data: project,
  });
});

// ─── GET /api/projects/:id/booked ─────────────────────────────────────────────
export const getProjectBookedPlots = asyncHandler(async (req, res) => {
  const bookedPlots = await projectService.getProjectBookedPlots(req.params.id);
  res.status(200).json({
    success: true,
    data: bookedPlots,
  });
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────
export const updateProject = asyncHandler(async (req, res) => {
  const tempFilePaths = req.files ? req.files.map((f) => f.path) : [];
  const project = await projectService.updateProject(
    req.params.id,
    req.body,
    tempFilePaths
  );
  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});
