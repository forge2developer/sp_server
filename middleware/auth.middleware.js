import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { AppError } from "./errorHandler.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Primary: look up by _id (works for UUID strings)
      req.user = await User.findOne({ _id: decoded.id }).select("-password");

      // Fallback 1: maybe the user's _id changed due to migration but email is in token
      if (!req.user && decoded.email) {
        req.user = await User.findOne({ email: decoded.email }).select("-password");
      }

      // Fallback 2: search raw collection in case of type mismatch (ObjectId vs String)
      if (!req.user) {
        const rawCol = mongoose.connection.collection("users");
        let rawUser = null;

        // Try as string match first
        rawUser = await rawCol.findOne({ _id: decoded.id });

        // Try as ObjectId if it looks like one (24 hex chars)
        if (!rawUser && /^[a-f0-9]{24}$/.test(decoded.id)) {
          rawUser = await rawCol.findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
        }

        if (rawUser) {
          // Instantiate as Mongoose document without saving
          req.user = new User(rawUser);
        }
      }

      if (!req.user) {
        return next(new AppError("Session expired. Please log in again.", 401));
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new AppError("Session expired. Please log in again.", 401));
      }
      return next(new AppError("Not authorized, token invalid.", 401));
    }
  } else {
    next(new AppError("Not authorized, no token", 401));
  }
});

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
