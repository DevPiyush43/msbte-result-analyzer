import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Admin = mongoose.model("Admin", adminSchema);
