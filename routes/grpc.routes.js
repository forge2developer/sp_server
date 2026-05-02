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

// ... existing user and project routes ...

// ─── GET /api/grpc/campaigns?organization=SP_PROMOTERS ─────────────────────────
router.get("/campaigns", async (req, res) => {
  try {
    const { organization } = req.query;
    const response = await fetchCampaigns(organization);
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

// ─── GET /api/grpc/lead-capture-configs?organization=SP_PROMOTERS ──────────────
router.get("/lead-capture-configs", async (req, res) => {
  try {
    const { organization } = req.query;
    const response = await fetchLeadCaptureConfigs(organization);
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

// ─── GET /api/grpc/users?organization=SP_PROMOTERS ─────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { organization } = req.query;
    const response = await fetchUsers(organization);
    res.status(200).json({
      success: response.success,
      count: response.count,
      data: response.users,
    });
  } catch (err) {
    console.error("gRPC gateway /users error:", err.message);
    res.status(500).json({ success: false, message: err.message });
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
    const status = err.code === 5 ? 404 : 500; // grpc NOT_FOUND = 5
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─── GET /api/grpc/projects?organization=SP_PROMOTERS ──────────────────────────
router.get("/projects", async (req, res) => {
  try {
    const { organization } = req.query;
    if (!organization) {
      return res.status(400).json({ success: false, message: "Organization is required" });
    }
    const response = await fetchProjects(organization);
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

// ─── GET /api/grpc/projects/:id?organization=SP_PROMOTERS ──────────────────────
router.get("/projects/:id", async (req, res) => {
  try {
    const { organization } = req.query;
    const response = await fetchProject(organization, req.params.id);
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
