import { Router } from "express";
import {
  getConfigs,
  getConfig,
  createConfig,
  updateConfig,
  deleteConfig,
} from "../controllers/leadCaptureConfig.controller.js";

const router = Router();

// /api/lead-capture-configs
router.route("/").get(getConfigs).post(createConfig);

// /api/lead-capture-configs/:id
router.route("/:id").get(getConfig).put(updateConfig).delete(deleteConfig);

export default router;
