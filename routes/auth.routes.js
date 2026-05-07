import { Router } from "express";
import { loginUser, getMe, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/me", protect, getMe);

export default router;
