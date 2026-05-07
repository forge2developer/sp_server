import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either 'user' or 'admin'",
      },
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
    collection: "user",
    toJSON: {
      transform(doc, ret) {
        delete ret.password; // strip password from JSON output
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Instance Method: Compare Password (plain-text, temporary) ────────────────
UserSchema.methods.matchPassword = function (enteredPassword) {
  return enteredPassword === this.password;
};

// ─── Static Method: Find Active User by Email ─────────────────────────────────
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select("+password");
};

const User = mongoose.model("user", UserSchema);

export default User;
