import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Get All Users ─────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  const col = mongoose.connection.collection("users");
  const rawUsers = await col.find({}).sort({ createdAt: -1 }).toArray();

  // Map raw docs to plain objects compatible with gRPC
  return rawUsers.map(u => ({
    _id: u._id?.toString() || "",
    profile_id: u.profile_id || 0,
    name: u.name || "",
    email: u.email || "",
    phone: u.phone || "",
    role: u.role || "user",
    isActive: u.isActive !== false,
    createdAt: u.createdAt || new Date(),
    updatedAt: u.updatedAt || new Date(),
  }));
};

// ─── Get User by ID ────────────────────────────────────────────────────────────
export const getUserById = async (id) => {
  const col = mongoose.connection.collection("users");
  
  // Try as string first
  let raw = await col.findOne({ _id: id });

  // Fallback: try as ObjectId
  if (!raw && /^[a-f0-9]{24}$/.test(id)) {
    raw = await col.findOne({ _id: new mongoose.Types.ObjectId(id) });
  }

  if (!raw) throw new AppError("User not found", 404);

  return {
    _id: raw._id?.toString() || "",
    profile_id: raw.profile_id || 0,
    name: raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    role: raw.role || "user",
    isActive: raw.isActive !== false,
    createdAt: raw.createdAt || new Date(),
    updatedAt: raw.updatedAt || new Date(),
  };
};

// ─── Create User ───────────────────────────────────────────────────────────────
export const createUser = async (data) => {
  const { name, email, phone, password, role } = data;

  if (!email) throw new AppError("Email is required", 400);

  const col = mongoose.connection.collection("users");

  // Check for duplicate email
  const existing = await col.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError("A user with this email already exists", 409);

  // Auto-increment profile_id
  const lastUser = await col.findOne({}, { sort: { profile_id: -1 } });
  const nextProfileId = lastUser?.profile_id ? lastUser.profile_id + 1 : 1;

  // Use Mongoose to create so pre-save hooks (bcrypt) run
  const user = await User.create({
    profile_id: nextProfileId,
    name,
    email: email.toLowerCase(),
    phone: phone || "",
    password,
    role: role || "user",
  });
  return user;
};

// ─── Update User ───────────────────────────────────────────────────────────────
export const updateUser = async (id, data) => {
  delete data.password;

  const col = mongoose.connection.collection("users");
  
  // Try string _id first, then ObjectId fallback
  let filter = { _id: id };
  let existing = await col.findOne(filter);
  if (!existing && /^[a-f0-9]{24}$/.test(id)) {
    filter = { _id: new mongoose.Types.ObjectId(id) };
    existing = await col.findOne(filter);
  }

  if (!existing) throw new AppError("User not found", 404);

  await col.updateOne(filter, { $set: { ...data, updatedAt: new Date() } });
  const updated = await col.findOne(filter);
  return updated;
};

// ─── Hard Delete User ──────────────────────────────────────────────────────────
export const deleteUser = async (id) => {
  const col = mongoose.connection.collection("users");

  let filter = { _id: id };
  let existing = await col.findOne(filter);
  if (!existing && /^[a-f0-9]{24}$/.test(id)) {
    filter = { _id: new mongoose.Types.ObjectId(id) };
    existing = await col.findOne(filter);
  }

  if (!existing) throw new AppError("User not found", 404);

  await col.deleteOne(filter);
  return existing;
};
// ─── Change Password ────────────────────────────────────────────────────────────
export const changePassword = async (userEmail, currentPassword, newPassword) => {
  console.log(`[userService] Attempting to find user for password change. Email: ${userEmail}`);
  
  // Use findByEmail to bypass any _id type mismatches
  const user = await User.findByEmail(userEmail);

  if (!user) {
    console.error(`[userService] User NOT FOUND for email: ${userEmail}`);
    throw new AppError("User not found", 404);
  }

  console.log(`[userService] User found: ${user.email}. Checking password...`);

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    console.warn(`[userService] Password mismatch for user: ${user.email}`);
    throw new AppError("Current password is incorrect", 401);
  }

  // Hash new password manually since we are using raw update
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Use raw collection update to completely bypass Mongoose UUID casting errors
  await mongoose.connection.collection("users").updateOne(
    { email: user.email },
    { $set: { password: hashedPassword, updatedAt: new Date() } }
  );

  console.log(`[userService] Password updated successfully for user: ${user.email}`);
  return user;
};
