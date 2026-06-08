import mongoose from "mongoose";
import { Job } from "../Model/Job-model.js";
import { JobStatusHistory } from "../Model/JobStatusHistory-model.js";
import { Notification } from "../Model/Notification-model.js";
import OrderStateMachineService from "../services/OrderStateMachineService.js";
import notificationService from "../services/notificationService.js";

// ── CREATE ─────────────────────────────────────────────────────────────────────

export const createJob = async (req, res, next) => {
  const { jobType, driverId } = req.body || {};

  if (!["DELIVERY", "RETURN"].includes(jobType)) {
    return res.status(400).json({ message: "jobType must be DELIVERY or RETURN" });
  }

  const initialStatus =
    jobType === "DELIVERY" ? "WAITING_FOR_ADMIN_CONFIRMATION" : "WAITING_FOR_RETURN_APPROVAL";

  try {
    const job = await Job.create({
      jobType,
      customerId: req.user._id,
      driverId: driverId || undefined,
      status: initialStatus,
    });

    // Notify admins of new job
    notificationService
      .sendForTransition({ job, oldStatus: null, newStatus: initialStatus })
      .catch(() => { });

    return res.status(201).json({ data: job });
  } catch (err) {
    next(err);
  }
};

// ── QUERY ──────────────────────────────────────────────────────────────────────

export const getJobs = async (req, res, next) => {
  const { status, jobType, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (jobType) filter.jobType = jobType;
  if (req.user.role === "DRIVER") filter.driverId = req.user._id;
  if (req.user.role === "USER") filter.customerId = req.user._id;

  try {
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("customerId", "name email")
        .populate("driverId", "name email")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({ total, page: Number(page), limit: Number(limit), data: jobs });
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const job = await Job.findById(id)
      .populate("customerId", "name email")
      .populate("driverId", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ data: job });
  } catch (err) {
    next(err);
  }
};

export const getJobTimeline = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const timeline = await JobStatusHistory.find({ jobId: id })
      .populate("actionBy", "name role")
      .sort({ createdAt: 1 });

    return res.status(200).json({ data: timeline });
  } catch (err) {
    next(err);
  }
};

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ data: notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// ── STATE MACHINE TRANSITION FACTORY ──────────────────────────────────────────

const makeTransitionHandler = (newStatus) => async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const updatedJob = await OrderStateMachineService.transition({
      jobId: id,
      newStatus,
      actionBy: req.user._id,
      actionRole: req.user.role,
      remark: req.body?.remark || "",
    });
    return res.status(200).json({ data: updatedJob });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// ── DELIVERY FLOW ──────────────────────────────────────────────────────────────
export const adminConfirm = makeTransitionHandler("WAITING_FOR_DRIVER_CONFIRMATION");
export const driverConfirm = makeTransitionHandler("DRIVER_CONFIRMED");
export const pickup = makeTransitionHandler("PICKED_UP");
export const inTransit = makeTransitionHandler("IN_TRANSIT");
export const complete = makeTransitionHandler("DELIVERED");

// ── RETURN FLOW ────────────────────────────────────────────────────────────────
export const returnApprove = makeTransitionHandler("RETURN_DRIVER_PENDING");
export const returnDriverConfirm = makeTransitionHandler("RETURN_DRIVER_CONFIRMED");
export const returnPickup = makeTransitionHandler("RETURN_PICKED_UP");
export const returnInTransit = makeTransitionHandler("RETURN_IN_TRANSIT");
export const returnComplete = makeTransitionHandler("RETURN_COMPLETED");

// ── REJECT FLOW ────────────────────────────────────────────────────────────────
export const reject = makeTransitionHandler("REJECT_REQUESTED");
export const rejectDriverConfirm = makeTransitionHandler("REJECT_DRIVER_CONFIRMED");
export const rejectApprove = makeTransitionHandler("REJECT_APPROVED");

// ── CUSTOMER REJECT FLOW ───────────────────────────────────────────────────────
export const customerReject = makeTransitionHandler("CUSTOMER_REJECTED");
export const customerRejectAcknowledge = makeTransitionHandler("CUSTOMER_REJECT_ACKNOWLEDGED");
export const customerRejectComplete = makeTransitionHandler("CUSTOMER_REJECT_COMPLETED");

// ── CANCELLATION FLOW ─────────────────────────────────────────────────────────
export const requestCancellation = makeTransitionHandler("CANCELLATION_REQUESTED");
export const approveCancellation = makeTransitionHandler("CANCELLATION_APPROVED");

// ── FILE UPLOAD ────────────────────────────────────────────────────────────────
export const uploadProof = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const job = await Job.findByIdAndUpdate(
      id,
      { proofOfDeliveryImage: req.file.path },
      { returnDocument: 'after' },
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ data: job });
  } catch (err) {
    next(err);
  }
};
