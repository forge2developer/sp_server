import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    profile_id: {
      type: Number,
      unique: true,
      sparse: true, // Allow nulls if not provided initially
    },
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
    phone: {
      type: String,
      trim: true,
      default: "",
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
        values: ["user", "manager", "admin"],
        message: "Role must be 'user', 'manager', or 'admin'",
      },
      default: "user",
    },
    organization: {
      type: String,
      trim: true,
      default: "SP_PROMOTERS",
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
    toJSON: {
      transform(doc, ret) {
        delete ret.password; // strip password from JSON output
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────
UserSchema.pre("save", async function () {
  // Only hash when password field is actually modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Compare Password ────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Static Method: Find Active User by Email ─────────────────────────────────
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select("+password");
};

const User = mongoose.model("User", UserSchema);

export default User;
