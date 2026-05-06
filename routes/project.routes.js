import { Router } from "express";
import { uploadImages } from "../middleware/upload.js";
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  bookPlot,
  reverseBooking,
  getProjectBookedPlots,
} from "../controllers/project.controller.js";

const router = Router();

// /api/projects — upload middleware handles multipart/form-data with up to 5 images
router.route("/").get(getAllProjects).post(uploadImages, createProject);

// /api/projects/:id/booked
router.route("/:id/booked").get(getProjectBookedPlots);

// /api/projects/:id/book
router.route("/:id/book").post(bookPlot);

// /api/projects/:id/reverse-book
router.route("/:id/reverse-book").post(reverseBooking);

// /api/projects/:id
router.route("/:id")
  .get(getProject)
  .put(uploadImages, updateProject)
  .delete(deleteProject);

export default router;
