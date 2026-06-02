import { staff } from "../modules/Model/staff-model.js";

// Must run after authUser middleware — relies on req.user._id being set
const isAdmin = async (req, res, next) => {
  try {
    const staffMember = await staff.findById(req.user._id);

    // Deny if user is not in staff collection or does not hold admin role
    if (!staffMember || staffMember.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default isAdmin;
