import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";

// ─── Get All Users ─────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  return User.find({ isActive: true }).select("-password");
};

// ─── Get User by ID ────────────────────────────────────────────────────────────
export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new AppError("User not found", 404);
  return user;
};

// ─── Create User ───────────────────────────────────────────────────────────────
export const createUser = async (data) => {
  const { name, email, password, role } = data;

  // Check for duplicate email before hitting the DB unique index
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError("A user with this email already exists", 409);

  const user = await User.create({ name, email, password, role });
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

// ─── Soft Delete User ──────────────────────────────────────────────────────────
export const deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
};
