import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);
