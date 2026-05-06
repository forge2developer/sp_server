import { Router } from "express";
import { loginUser, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;
