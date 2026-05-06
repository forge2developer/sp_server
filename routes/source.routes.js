import { Router } from "express";
import { getSources, seedSources } from "../controllers/source.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getSources);
router.post("/seed", protect, seedSources);

export default router;
