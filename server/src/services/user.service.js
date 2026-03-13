import mongoose from "mongoose";
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS || 10);

    const [user] = await User.create(
      [{
        username,
        email,
        passwordHash,
        role,
        createdBy,
        status: "ACTIVE"
      }],
      { session }
    );

    if (role === "ADMIN") {
      await Admin.create(
        [{
          userId: user._id,
          fullName,
          contactNumber
        }],
        { session }
      );
    } else if (role === "TEACHER") {
      await TeacherProfile.create(
        [{
          userId: user._id,
          fullName,
          department,
          institution
        }],
        { session }
      );
    }

    await session.commitTransaction();
    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
