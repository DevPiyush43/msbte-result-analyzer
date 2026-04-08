import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";
import { TeacherProfile } from "../models/TeacherProfile.js";
import { env } from "../config/env.js";

export const createUserWithProfile = async ({
  username,
  email,
  password,
  role,
  fullName,
  contactNumber,
  department,
  institution,
  createdBy
}) => {
  // Hash password
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS || 10);

  // Create the base user document
  const user = await User.create({
    username,
    email,
    passwordHash,
    fullName: fullName || "",
    role,
    createdBy,
    status: "ACTIVE"
  });

  // Create the role-specific profile (best-effort, rollback user if it fails)
  try {
    if (role === "ADMIN") {
      await Admin.create({
        userId: user._id,
        fullName,
        contactNumber
      });
    } else if (role === "TEACHER") {
      await TeacherProfile.create({
        userId: user._id,
        fullName,
        department: department || "",
        institution: institution || "MSBTE College"
      });
    }
  } catch (profileError) {
    // Rollback: delete the user if profile creation fails
    await User.findByIdAndDelete(user._id).catch(() => {});
    throw profileError;
  }

  return user;
};
