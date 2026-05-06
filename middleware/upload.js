import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "./errorHandler.js";

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for images
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

/**
 * Creates a multer upload middleware configured for project layout images.
 * Files are stored temporarily and then moved to the correct project folder on submit.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Temporary upload directory — files are moved to project folder after project creation
    const uploadDir = path.resolve("uploads/temp");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, GIF, and SVG are allowed.`,
        400
      ),
      false
    );
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Max 5 images per upload
  },
}).array("images", 5);

/**
 * Move uploaded files from temp to the final project folder.
 * @param {string[]} tempPaths - Array of temp file paths
 * @param {string} projectName - Project name (used for folder name)
 * @returns {string[]} Array of final relative paths (for DB storage)
 */
export const moveToProjectFolder = (tempPaths, projectName) => {
  // Sanitize project name for folder usage
  const safeName = projectName.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_");
  const destDir = path.resolve(`uploads/plots/${safeName}`);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  return tempPaths.map((tempPath) => {
    const fileName = path.basename(tempPath);
    const destPath = path.join(destDir, fileName);
    fs.renameSync(tempPath, destPath);
    return `/uploads/plots/${safeName}/${fileName}`;
  });
};
