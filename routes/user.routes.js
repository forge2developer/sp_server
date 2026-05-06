import { Router } from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all routes
router.use(protect);

// /api/users
router.route("/").get(getUsers).post(createUser);

// /api/users/change-password
router.post("/change-password", changePassword);

// /api/users/:id
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);


export default router;
