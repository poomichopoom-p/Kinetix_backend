import { Staff } from "../modules/Model/staff-model.js";
import { User } from "../modules/Model/user-model.js";

const isAdmin = async (req, res, next) => {
  try {

    let account = await Staff.findById(req.user._id);


    if (!account) {
      account = await User.findById(req.user._id);
    }


    const isUserAdmin = account && (account.role === "admin" || account.role === "ADMIN");

    if (!account || !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required"
      });
    }

    req.admin = account;
    next();
  } catch (err) {
    next(err);
  }
};

export default isAdmin;