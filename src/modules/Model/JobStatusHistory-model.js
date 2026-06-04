import mongoose from "mongoose";

const jobStatusHistorySchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryUser", required: true },
    actionRole: { type: String, enum: ["USER", "DRIVER", "ADMIN"], required: true },
    remark: { type: String, default: "" },
  },
  { timestamps: true },
);

export const JobStatusHistory = mongoose.model(
  "JobStatusHistory",
  jobStatusHistorySchema,
  "job_status_histories",
);
