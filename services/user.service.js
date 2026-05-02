import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Get All Users (filtered by organization) ──────────────────────────────────
export const getAllUsers = async (organization) => {
  const filter = {};
  if (organization) filter.organization = organization;
  return User.find(filter).select("-password").sort({ createdAt: -1 });
};

// ─── Get User by ID ────────────────────────────────────────────────────────────
export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new AppError("User not found", 404);
  return user;
};

// ─── Create User ───────────────────────────────────────────────────────────────
export const createUser = async (data) => {
  const { name, email, phone, password, role, organization } = data;

  if (!email) throw new AppError("Email is required", 400);

  // Check for duplicate email before hitting the DB unique index
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError("A user with this email already exists", 409);

  // Auto-increment logic for profile_id
  const lastUser = await User.findOne().sort({ profile_id: -1 });
  const nextProfileId = lastUser && lastUser.profile_id ? lastUser.profile_id + 1 : 1;

  const user = await User.create({
    profile_id: nextProfileId,
    name,
    email: email.toLowerCase(),
    phone: phone || "",
    password,
    role: role || "user",
    organization: organization || "SP_PROMOTERS",
  });
  return user;
};

// ─── Update User ───────────────────────────────────────────────────────────────
export const updateUser = async (id, data) => {
  // Prevent accidental password update through this method
  delete data.password;

  const user = await User.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,          // return updated document
      runValidators: true, // enforce schema validators on update
    }
  ).select("-password");

  if (!user) throw new AppError("User not found", 404);
  return user;
};

// ─── Hard Delete User ──────────────────────────────────────────────────────────
export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError("User not found", 404);
  return user;
};
