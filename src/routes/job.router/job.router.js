import { Router } from "express";
import deliveryAuth from "../../middleware/deliveryAuth.js";
import { requireRole } from "../../middleware/rbac.js";
import { upload } from "../../middleware/upload.js";
import {
  createJob,
  getJobs,
  getJobById,
  getJobTimeline,
  getMyNotifications,
  markNotificationRead,
  adminConfirm,
  driverConfirm,
  pickup,
  inTransit,
  complete,
  returnApprove,
  returnDriverConfirm,
  returnPickup,
  returnInTransit,
  returnComplete,
  reject,
  rejectDriverConfirm,
  rejectApprove,
  customerReject,
  customerRejectAcknowledge,
  customerRejectComplete,
  requestCancellation,
  approveCancellation,
  uploadProof,
} from "../../modules/controller/job.controller.js";

export const router = Router();

router.use(deliveryAuth);

router.get("/notifications/:_id", getMyNotifications);
router.patch("/notifications/:_id", markNotificationRead);

router.post("/", requireRole("USER", "ADMIN"), createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.get("/:id/timeline", getJobTimeline);

router.patch("/:id/admin-confirm", requireRole("ADMIN"), adminConfirm);
router.patch("/:id/driver-confirm", requireRole("DRIVER"), driverConfirm);
router.patch("/:id/pickup", requireRole("DRIVER"), pickup);
router.patch("/:id/in-transit", requireRole("DRIVER"), inTransit);
router.patch("/:id/complete", requireRole("DRIVER"), complete);

router.patch("/:id/return-approve", requireRole("ADMIN"), returnApprove);
router.patch("/:id/return-driver-confirm", requireRole("DRIVER"), returnDriverConfirm);
router.patch("/:id/return-pickup", requireRole("DRIVER"), returnPickup);
router.patch("/:id/return-in-transit", requireRole("DRIVER"), returnInTransit);
router.patch("/:id/return-complete", requireRole("DRIVER"), returnComplete);

router.patch("/:id/reject", requireRole("ADMIN"), reject);
router.patch("/:id/reject-driver-confirm", requireRole("DRIVER"), rejectDriverConfirm);
router.patch("/:id/reject-approve", requireRole("ADMIN"), rejectApprove);

router.patch("/:id/customer-reject", requireRole("USER"), customerReject);
router.patch("/:id/customer-reject-acknowledge", requireRole("DRIVER"), customerRejectAcknowledge);
router.patch("/:id/customer-reject-complete", requireRole("ADMIN"), customerRejectComplete);

router.patch("/:id/request-cancellation", requireRole("USER"), requestCancellation);
router.patch("/:id/approve-cancellation", requireRole("ADMIN"), approveCancellation);

router.patch("/:id/upload-proof", requireRole("DRIVER"), upload.single("proof"), uploadProof);
