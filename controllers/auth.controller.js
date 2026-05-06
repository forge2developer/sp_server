import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── Generate JWT Token ──────────────────────────────────────────────────────
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization } = req.body;

  const userExists = await User.findByEmail(email);

  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    organization,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token: generateToken(user._id, user.email),
      },
    });
  } else {
    throw new AppError("Invalid user data", 400);
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  // 1. Find user by email (explicitly select password)
  const user = await User.findByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 2. Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // 3. Return user data and token
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      token: generateToken(user._id, user.email),
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
