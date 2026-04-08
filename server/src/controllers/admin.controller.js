import { z } from "zod";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";
import { TeacherProfile } from "../models/TeacherProfile.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { createUserWithProfile } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER"]),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  contactNumber: z.string().optional(),
  department: z.string().optional(),
  institution: z.string().optional(),
});

export const createUser = asyncHandler(async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0];
    return res.status(400).json({ 
      error: { 
        message: firstError || "Please fill in all required fields correctly", 
        details: parsed.error.flatten() 
      } 
    });
  }

  const { role } = parsed.data;

  // SYSTEM_ADMIN can create ADMIN or TEACHER
  // ADMIN can only create TEACHER
  if (req.user.role === "ADMIN" && role !== "TEACHER") {
    return res.status(403).json({ error: { message: "Admins can only create teachers" } });
  }

  const existing = await User.findOne({ 
    $or: [{ email: parsed.data.email }, { username: parsed.data.username }] 
  });
  
  if (existing) {
    return res.status(409).json({ error: { message: "Username or Email already exists" } });
  }

  const user = await createUserWithProfile({
    ...parsed.data,
    createdBy: req.user.sub
  });

  await ActivityLog.create({
    userId: req.user.sub,
    actionType: "USER_CREATION",
    description: `Created user ${user.username} with role ${user.role}`
  });

  return res.status(201).json({
    message: `${user.role} created successfully`,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === "ADMIN") {
    query = { role: "TEACHER" };
  }

  const users = await User.find(query)
    .select("-passwordHash")
    .sort({ createdAt: -1 });
    
  return res.json({ users });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "DISABLED"].includes(status)) {
    return res.status(400).json({ error: { message: "Invalid status" } });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: { message: "User not found" } });
  }

  if (user.role === "SYSTEM_ADMIN") {
    return res.status(403).json({ error: { message: "Cannot disable system admin" } });
  }

  user.status = status;
  await user.save();

  await ActivityLog.create({
    userId: req.user.sub,
    actionType: "USER_STATUS_CHANGE",
    description: `${status === "ACTIVE" ? "Enabled" : "Disabled"} user ${user.username}`
  });

  return res.json({ message: `User ${status === "ACTIVE" ? "enabled" : "disabled"} successfully` });
});
