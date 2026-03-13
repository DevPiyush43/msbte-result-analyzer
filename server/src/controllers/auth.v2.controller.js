import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1),
}).refine(data => data.username || data.email, {
  message: "Either username or email is required",
  path: ["username"]
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      username: user.username,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Validation error", details: parsed.error.flatten() } });
  }

  const { username, email, password } = parsed.data;

  const user = await User.findOne({
    $or: [
      ...(username ? [{ username }] : []),
      ...(email ? [{ email }] : [])
    ]
  });

  if (!user) {
    return res.status(401).json({ error: { message: "Invalid credentials" } });
  }

  if (user.status === "DISABLED") {
    return res.status(403).json({ error: { message: "Account is disabled. Please contact administrator." } });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: { message: "Invalid credentials" } });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).select("-passwordHash").lean();
  if (!user) {
    return res.status(404).json({ error: { message: "User not found" } });
  }

  return res.json({ user });
});
