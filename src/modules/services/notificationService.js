import { Notification } from "../Model/Notification-model.js";
import { DeliveryUser } from "../Model/DeliveryUser-model.js";

const notificationService = {
  async send({ userId, title, message }) {
    return Notification.create({ userId, title, message });
  },

  async sendMany(notifications) {
    if (!notifications.length) return;
    return Notification.insertMany(notifications);
  },

  async sendForTransition({ job, oldStatus, newStatus }) {
    const batch = [];

    // Always notify customer on every status change
    if (job.customerId) {
      batch.push({
        userId: job.customerId,
        title: "อัปเดตสถานะงาน",
        message: `งาน ${job.jobNo} เปลี่ยนสถานะเป็น ${newStatus}`,
      });
    }

    // Notify driver when a job is waiting for their confirmation
    if (
      (newStatus === "WAITING_FOR_DRIVER_CONFIRMATION" ||
        newStatus === "RETURN_DRIVER_PENDING") &&
      job.driverId
    ) {
      batch.push({
        userId: job.driverId,
        title: "งานใหม่รอรับ",
        message: `งาน ${job.jobNo} รอการยืนยันจากคุณ`,
      });
    }

    // Notify all admins when a reject is requested or job is created
    if (newStatus === "REJECT_REQUESTED" || oldStatus === null) {
      const admins = await DeliveryUser.find({ role: "ADMIN" }).select("_id");
      for (const admin of admins) {
        batch.push({
          userId: admin._id,
          title: newStatus === "REJECT_REQUESTED" ? "คำขอปฏิเสธงาน" : "งานใหม่รอการอนุมัติ",
          message: `งาน ${job.jobNo} ต้องการการดำเนินการ`,
        });
      }
    }

    if (batch.length) await notificationService.sendMany(batch);
  },
};

export default notificationService;
