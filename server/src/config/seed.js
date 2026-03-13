import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { env } from "./env.js";

export const seedSystemAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "SYSTEM_ADMIN" });
    if (!existingAdmin) {
      console.log("Seeding system administrator...");
      
      const username = process.env.SYSTEM_ADMIN_USERNAME || "system_admin";
      const email = process.env.SYSTEM_ADMIN_EMAIL || "admin@msbte.com";
      const password = process.env.SYSTEM_ADMIN_PASSWORD || "secure_dev_password";
      
      const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS || 10);
      
      await User.create({
        username,
        email,
        passwordHash,
        role: "SYSTEM_ADMIN",
        status: "ACTIVE"
      });
      
      console.log("System administrator seeded successfully.");
    } else {
      console.log("System administrator already exists.");
    }
  } catch (error) {
    console.error("Error seeding system administrator:", error);
  }
};
