import * as userService from "../services/user.service.js";

/**
 * asyncHandler — wraps async controllers so we don't need try/catch in every one.
 * Errors are forwarded to the centralized error handler via next(err).
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── GET /api/users ────────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// ─── GET /api/users/:id ────────────────────────────────────────────────────────
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─── POST /api/users ───────────────────────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

// ─── PUT /api/users/:id ────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// ─── DELETE /api/users/:id ─────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
  });
});
