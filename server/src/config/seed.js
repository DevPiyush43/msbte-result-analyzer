import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { env } from "./env.js";

const PREDEFINED_TEACHERS = [
  { username: "CSS",  fullName: "CSS Teacher",         email: "css@msbte.edu",   password: "CSS123"  },
  { username: "DFH",  fullName: "DFH Teacher",         email: "dfh@msbte.edu",   password: "Dfh123"  },
  { username: "ETI",  fullName: "ETI Teacher",         email: "eti@msbte.edu",   password: "ETI123"  },
  { username: "MAN",  fullName: "MAN Teacher",         email: "man@msbte.edu",   password: "MAN123"  },
  { username: "NIS",  fullName: "NIS Teacher",         email: "nis@msbte.edu",   password: "Nis123"  },
  { username: "SFT",  fullName: "SFT Teacher",         email: "sft@msbte.edu",   password: "SFT123"  },
];

export const seedSystemAdmin = async () => {
  try {
    // Seed SYSTEM_ADMIN
    const existingAdmin = await User.findOne({ role: "SYSTEM_ADMIN" });
    if (!existingAdmin) {
      console.log("Seeding system administrator...");
      const username = process.env.SYSTEM_ADMIN_USERNAME || "system_admin";
      const email = process.env.SYSTEM_ADMIN_EMAIL || "admin@msbte.com";
      const password = process.env.SYSTEM_ADMIN_PASSWORD || "secure_dev_password";
      const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS || 10);
      await User.create({ username, fullName: "System Administrator", email, passwordHash, role: "SYSTEM_ADMIN", status: "ACTIVE" });
      console.log("System administrator seeded successfully.");
    } else {
      console.log("System administrator already exists.");
    }

    // Seed ADMIN account
    const existingAdminUser = await User.findOne({ username: "admin" });
    if (!existingAdminUser) {
      console.log("Seeding admin account...");
      const passwordHash = await bcrypt.hash("admin123", env.BCRYPT_SALT_ROUNDS || 10);
      await User.create({ username: "admin", fullName: "Administrator", email: "admin@msbte.edu", passwordHash, role: "ADMIN", status: "ACTIVE" });
      console.log("Admin account seeded successfully.");
    }

    // Seed predefined teachers
    for (const teacher of PREDEFINED_TEACHERS) {
      const exists = await User.findOne({ username: teacher.username });
      if (!exists) {
        const passwordHash = await bcrypt.hash(teacher.password, env.BCRYPT_SALT_ROUNDS || 10);
        await User.create({
          username: teacher.username,
          fullName: teacher.fullName,
          email: teacher.email,
          passwordHash,
          role: "TEACHER",
          status: "ACTIVE",
        });
        console.log(`Teacher account [${teacher.username}] seeded.`);
      }
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};
