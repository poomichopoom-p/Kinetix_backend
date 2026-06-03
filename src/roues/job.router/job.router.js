import { Router } from "express";
import deliveryAuth from "../../middelware/deliveryAuth.js";
import { requireRole } from "../../middelware/rbac.js";
import { upload } from "../../middelware/upload.js";
import {
  createJob,
  getJobs,
  getJobById,
  getJobTimeline,
  getMyNotifications,
  markNotificationRead,
  // Delivery
  adminConfirm,
  driverConfirm,
  pickup,
  inTransit,
  complete,
  // Return
  returnApprove,
  returnDriverConfirm,
  returnPickup,
  returnInTransit,
  returnComplete,
  // Reject
  reject,
  rejectDriverConfirm,
  rejectApprove,
  // Customer Reject
  customerReject,
  customerRejectAcknowledge,
  customerRejectComplete,
  // Cancellation
  requestCancellation,
  approveCancellation,
  // Upload
  uploadProof,
} from "../../modules/controller/job.controller.js";

export const router = Router();

// All job routes require authentication
router.use(deliveryAuth);

// ── Notifications ──────────────────────────────────────────────────────────────
router.get("/notifications",        getMyNotifications);
router.patch("/notifications/read", markNotificationRead);

// ── CRUD ───────────────────────────────────────────────────────────────────────
router.post("/",       requireRole("USER", "ADMIN"), createJob);
router.get("/",        getJobs);
router.get("/:id",     getJobById);
router.get("/:id/timeline", getJobTimeline);

// ── Delivery Flow ──────────────────────────────────────────────────────────────
router.patch("/:id/admin-confirm",  requireRole("ADMIN"),  adminConfirm);
router.patch("/:id/driver-confirm", requireRole("DRIVER"), driverConfirm);
router.patch("/:id/pickup",         requireRole("DRIVER"), pickup);
router.patch("/:id/in-transit",     requireRole("DRIVER"), inTransit);
router.patch("/:id/complete",       requireRole("DRIVER"), complete);

// ── Return Flow ────────────────────────────────────────────────────────────────
router.patch("/:id/return-approve",        requireRole("ADMIN"),  returnApprove);
router.patch("/:id/return-driver-confirm", requireRole("DRIVER"), returnDriverConfirm);
router.patch("/:id/return-pickup",         requireRole("DRIVER"), returnPickup);
router.patch("/:id/return-in-transit",     requireRole("DRIVER"), returnInTransit);
router.patch("/:id/return-complete",       requireRole("DRIVER"), returnComplete);

// ── Reject Flow ────────────────────────────────────────────────────────────────
router.patch("/:id/reject",               requireRole("ADMIN"),  reject);
router.patch("/:id/reject-driver-confirm", requireRole("DRIVER"), rejectDriverConfirm);
router.patch("/:id/reject-approve",       requireRole("ADMIN"),  rejectApprove);

// ── Customer Reject Flow ───────────────────────────────────────────────────────
router.patch("/:id/customer-reject",             requireRole("USER"),   customerReject);
router.patch("/:id/customer-reject-acknowledge", requireRole("DRIVER"), customerRejectAcknowledge);
router.patch("/:id/customer-reject-complete",    requireRole("ADMIN"),  customerRejectComplete);

// ── Cancellation Flow ──────────────────────────────────────────────────────────
router.patch("/:id/request-cancellation", requireRole("USER"),  requestCancellation);
router.patch("/:id/approve-cancellation", requireRole("ADMIN"), approveCancellation);

// ── File Upload ────────────────────────────────────────────────────────────────
router.patch("/:id/upload-proof", requireRole("DRIVER"), upload.single("proof"), uploadProof);
