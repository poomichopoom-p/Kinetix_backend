import { Staff } from "../modules/Model/staff-model.js";
import { User } from "../modules/Model/user-model.js";

const isAdmin = async (req, res, next) => {
  try {

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // First check Staff model (admin accounts)
    let account = await Staff.findById(userId);

    // If not found, check User model
    if (!account) {
      account = await User.findById(userId);
    }

    if (!account) {
      return res.status(403).json({
        success: false,
        message: "Account not found"
      });
    }

    // Check role (admin or ADMIN)
    const isUserAdmin = account.role === "admin" || account.role === "ADMIN";

    if (!isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required"
      });
    }

    // Attach admin info to request
    req.admin = account;
    next();
  } catch (err) {
    next(err);
  }
};

export default isAdmin;