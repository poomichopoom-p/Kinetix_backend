import { Job, FINAL_STATES } from "../Model/Job-model.js";
import { JobStatusHistory } from "../Model/JobStatusHistory-model.js";
import notificationService from "./notificationService.js";

// Maps each status to { nextStatus: allowedRoles[] }
const TRANSITIONS = {
  // ── Delivery Flow ──────────────────────────────────────────────────
  WAITING_FOR_ADMIN_CONFIRMATION: {
    WAITING_FOR_DRIVER_CONFIRMATION: ["ADMIN"],
    REJECT_REQUESTED: ["ADMIN"],
    CANCELLATION_REQUESTED: ["USER"], // User requests cancel before dispatch
  },
  CANCELLATION_REQUESTED: {
    CANCELLATION_APPROVED: ["ADMIN"], // Admin approves cancellation
  },
  WAITING_FOR_DRIVER_CONFIRMATION: {
    DRIVER_CONFIRMED: ["DRIVER"],
  },
  DRIVER_CONFIRMED: {
    PICKED_UP: ["DRIVER"],
  },
  PICKED_UP: {
    IN_TRANSIT: ["DRIVER"],
  },
  IN_TRANSIT: {
    DELIVERED: ["DRIVER"],
    CUSTOMER_REJECTED: ["USER"], // Customer refuses delivery on arrival
  },

  // ── Customer Reject Flow ───────────────────────────────────────────
  CUSTOMER_REJECTED: {
    CUSTOMER_REJECT_ACKNOWLEDGED: ["DRIVER"], // Driver acknowledges rejection
  },
  CUSTOMER_REJECT_ACKNOWLEDGED: {
    CUSTOMER_REJECT_COMPLETED: ["ADMIN"], // Admin closes the case
  },

  // ── Return Flow ────────────────────────────────────────────────────
  WAITING_FOR_RETURN_APPROVAL: {
    RETURN_DRIVER_PENDING: ["ADMIN"],
  },
  RETURN_DRIVER_PENDING: {
    RETURN_DRIVER_CONFIRMED: ["DRIVER"],
  },
  RETURN_DRIVER_CONFIRMED: {
    RETURN_PICKED_UP: ["DRIVER"],
  },
  RETURN_PICKED_UP: {
    RETURN_IN_TRANSIT: ["DRIVER"],
  },
  RETURN_IN_TRANSIT: {
    RETURN_COMPLETED: ["DRIVER"],
  },

  // ── Reject Flow ────────────────────────────────────────────────────
  REJECT_REQUESTED: {
    REJECT_DRIVER_CONFIRMED: ["DRIVER"],
  },
  REJECT_DRIVER_CONFIRMED: {
    REJECT_APPROVED: ["ADMIN"],
  },
};

const makeError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const OrderStateMachineService = {
  /**
   * Transition a job to a new status.
   * Validates current state, role permission, updates DB, logs history, sends notifications.
   */
  async transition({ jobId, newStatus, actionBy, actionRole, remark = "" }) {
    const job = await Job.findById(jobId);
    if (!job) throw makeError("Job not found", 404);

    const currentStatus = job.status;

    if (FINAL_STATES.includes(currentStatus)) {
      throw makeError(`Job is already in final state: ${currentStatus}`, 409);
    }

    const allowedTransitions = TRANSITIONS[currentStatus];
    if (!allowedTransitions?.[newStatus]) {
      throw makeError(
        `Invalid transition: ${currentStatus} → ${newStatus}`,
        409,
      );
    }

    if (!allowedTransitions[newStatus].includes(actionRole)) {
      throw makeError(
        `Role '${actionRole}' is not allowed to perform this transition`,
        403,
      );
    }

    // Timestamp side-effects
    const timestamps = {};
    if (newStatus === "PICKED_UP" || newStatus === "RETURN_PICKED_UP") {
      timestamps.pickupAt = new Date();
    }
    if (newStatus === "DELIVERED") timestamps.deliveredAt = new Date();
    if (newStatus === "RETURN_COMPLETED") timestamps.returnedAt = new Date();

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status: newStatus, ...timestamps },
      { returnDocument: 'after' },
    ).populate("customerId", "name email").populate("driverId", "name email");

    await JobStatusHistory.create({
      jobId,
      oldStatus: currentStatus,
      newStatus,
      actionBy,
      actionRole,
      remark,
    });

    // Fire-and-forget — don't let notification failure break the response
    notificationService
      .sendForTransition({ job: updatedJob, oldStatus: currentStatus, newStatus })
      .catch(() => { });

    return updatedJob;
  },
};

export default OrderStateMachineService;
