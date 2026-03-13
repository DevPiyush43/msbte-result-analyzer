import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actionType: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
