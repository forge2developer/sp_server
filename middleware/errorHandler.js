  /**
 * Centralized Error Handler Middleware
 * Handles all errors thrown/passed via next(err) in controllers.
 */

// Custom application error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // operational = safe to expose to client
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper to send consistent error responses
const sendError = (res, statusCode, message, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

// ─── Error Classifier ─────────────────────────────────────────────────────────

const handleCastError = (err) =>
  new AppError(`Invalid value for field: ${err.path}`, 400);

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return { statusCode: 422, message: "Validation failed", errors };
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `Duplicate value "${value}" for field "${field}". Please use a different value.`,
    409
  );
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

// ─── Main Error Handler ────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, statusCode: err.statusCode || 500 };

  // Log all errors in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error("🔴 Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // Mongoose: invalid ObjectId
  if (err.name === "CastError") {
    const appErr = handleCastError(err);
    return sendError(res, appErr.statusCode, appErr.message);
  }

  // Mongoose: validation error
  if (err.name === "ValidationError") {
    const { statusCode, message, errors } = handleValidationError(err);
    return sendError(res, statusCode, message, errors);
  }

  // MongoDB: duplicate key (E11000)
  if (err.code === 11000) {
    const appErr = handleDuplicateKeyError(err);
    return sendError(res, appErr.statusCode, appErr.message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const appErr = handleJWTError();
    return sendError(res, appErr.statusCode, appErr.message);
  }
  if (err.name === "TokenExpiredError") {
    const appErr = handleJWTExpiredError();
    return sendError(res, appErr.statusCode, appErr.message);
  }

  // Known operational error (thrown via AppError)
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  // Unknown / programming error — don't leak details in production
  if (process.env.NODE_ENV === "production") {
    return sendError(res, 500, "Something went wrong. Please try again.");
  }

  return sendError(res, err.statusCode || 500, err.message || "Internal Server Error");
};

export default errorHandler;
