import mongoose from "mongoose";

const studentResultSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    enrollmentNumber: { type: String, required: true, trim: true },
    marksheetEnrollmentNumber: { type: String, trim: true },
    seatNumber: { type: String, trim: true },
    subjectMarks: { type: Object },
    totalMarks: { type: Number },
    percentage: { type: Number },
    resultStatus: { type: String, enum: ["Pass", "Fail", "Unknown"], default: "Unknown" },
    resultClass: { type: String, trim: true },
    rawHtml: { type: String },
    fetchedAt: { type: Date },
    errorMessage: { type: String },
    retryAttempts: { type: Number, default: 0 },
  },
  { _id: false }
);

const resultBatchSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    uploadDate: { type: Date, default: Date.now, index: true },
    totalStudents: { type: Number, default: 0 },
    passCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    topperName: { type: String, trim: true },
    topperPercentage: { type: Number },
    results: { type: [studentResultSchema], default: [] },
    failedQueue: { type: [String], default: [] }, // Enrollment/Seat numbers that failed
    status: { type: String, enum: ["created", "fetching", "completed", "failed", "retrying"], default: "created" },
    errors: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ResultBatch = mongoose.model("ResultBatch", resultBatchSchema);
