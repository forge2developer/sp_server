import { Router } from "express";
import { 
  fetchUsers, 
  fetchUser, 
  fetchProjects, 
  fetchProject,
  fetchCampaigns,
  fetchCampaign,
  fetchLeadCaptureConfigs,
  fetchLeadCaptureConfig
} from "../grpc/grpcClient.js";

const router = Router();

// ─── GET /api/grpc/campaigns ────────────────────────────────────────────────────
router.get("/campaigns", async (req, res) => {
  try {
    const response = await fetchCampaigns();
    res.status(200).json({
      success: response.success,
      count: response.count,
      data: response.data,
    });
  } catch (err) {
    console.error("gRPC gateway /campaigns error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/campaigns/:id ───────────────────────────────────────────────
router.get("/campaigns/:id", async (req, res) => {
  try {
    const response = await fetchCampaign(req.params.id);
    res.status(200).json({
      success: response.success,
      data: response.data,
    });
  } catch (err) {
    const status = err.code === 5 ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/lead-capture-configs ────────────────────────────────────────
router.get("/lead-capture-configs", async (req, res) => {
  try {
    const response = await fetchLeadCaptureConfigs();
    res.status(200).json({
      success: response.success,
      count: response.count,
      data: response.data,
    });
  } catch (err) {
    console.error("gRPC gateway /lead-capture-configs error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/lead-capture-configs/:id ────────────────────────────────────
router.get("/lead-capture-configs/:id", async (req, res) => {
  try {
    const response = await fetchLeadCaptureConfig(req.params.id);
    res.status(200).json({
      success: response.success,
      data: response.data,
    });
  } catch (err) {
    const status = err.code === 5 ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/users ────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    console.log("[gRPC Gateway] Fetching all users");
    const response = await fetchUsers();
    res.status(200).json({
      success: response.success,
      count: response.count,
      data: response.users,
    });
  } catch (err) {
    console.error("gRPC gateway /users error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message,
      details: err.details || "No extra details"
    });
  }
});

// ─── GET /api/grpc/users/:id ───────────────────────────────────────────────────
router.get("/users/:id", async (req, res) => {
  try {
    const response = await fetchUser(req.params.id);
    res.status(200).json({
      success: response.success,
      data: response.user,
    });
  } catch (err) {
    const status = err.code === 5 ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/projects ─────────────────────────────────────────────────────
router.get("/projects", async (req, res) => {
  try {
    const response = await fetchProjects();
    res.status(200).json({
      success: response.success,
      count: response.count,
      data: response.projects,
    });
  } catch (err) {
    console.error("gRPC gateway /projects error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/projects/:id ────────────────────────────────────────────────
router.get("/projects/:id", async (req, res) => {
  try {
    const response = await fetchProject(req.params.id);
    res.status(200).json({
      success: response.success,
      data: response.project,
    });
  } catch (err) {
    const status = err.code === 5 ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

export default router;
