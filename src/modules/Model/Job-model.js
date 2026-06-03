import mongoose from "mongoose";

export const JOB_STATUSES = [
  // Delivery
  "WAITING_FOR_ADMIN_CONFIRMATION",
  "WAITING_FOR_DRIVER_CONFIRMATION",
  "DRIVER_CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  // Return
  "WAITING_FOR_RETURN_APPROVAL",
  "RETURN_DRIVER_PENDING",
  "RETURN_DRIVER_CONFIRMED",
  "RETURN_PICKED_UP",
  "RETURN_IN_TRANSIT",
  "RETURN_COMPLETED",
  // Reject (Admin-initiated)
  "REJECT_REQUESTED",
  "REJECT_DRIVER_CONFIRMED",
  "REJECT_APPROVED",
  // Customer Reject (Customer refuses delivery on arrival)
  "CUSTOMER_REJECTED",
  "CUSTOMER_REJECT_ACKNOWLEDGED",
  "CUSTOMER_REJECT_COMPLETED",
  // Cancellation (User requests cancel before dispatch, Admin approves)
  "CANCELLATION_REQUESTED",
  "CANCELLATION_APPROVED",
];

export const FINAL_STATES = [
  "DELIVERED",
  "RETURN_COMPLETED",
  "REJECT_APPROVED",
  "CUSTOMER_REJECT_COMPLETED",
  "CANCELLATION_APPROVED",
];

const jobSchema = new mongoose.Schema(
  {
    jobNo: { type: String, unique: true },
    jobType: { type: String, enum: ["DELIVERY", "RETURN"], required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryUser", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryUser", default: null },
    status: { type: String, enum: JOB_STATUSES, required: true },
    rejectReason: { type: String, default: null },
    pickupAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
    proofOfDeliveryImage: { type: String, default: null },
  },
  { timestamps: true },
);

jobSchema.pre("save", async function () {
  if (this.jobNo) return;
  const count = await mongoose.model("Job").countDocuments();
  this.jobNo = `JOB-${String(count + 1).padStart(6, "0")}`;
});

export const Job = mongoose.model("Job", jobSchema, "jobs");
