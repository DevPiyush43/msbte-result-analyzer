import mongoose from "mongoose";

const extractionLogSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "ResultBatch", required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    seatRange: { type: String },
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    totalRequested: { type: Number, default: 0 },
    status: { type: String, enum: ["STARTED", "COMPLETED", "FAILED"], default: "STARTED" }
  },
  {
    timestamps: true,
  }
);

export const ExtractionLog = mongoose.model("ExtractionLog", extractionLogSchema);
