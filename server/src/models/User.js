import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { 
      type: String, 
      required: true, 
      enum: ["SYSTEM_ADMIN", "ADMIN", "TEACHER"],
      default: "TEACHER" 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" }
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
