import jwt from "jsonwebtoken";
<<<<<<< HEAD
import cookieParser from "cookie-parser";
import { User } from "../modules/Model/users-model.js";
const authUser = async (req, res, next) => {
  let token = req.cookies?.accessToken;
=======
>>>>>>> dbc1d4f7fb5e51db8f7de34df5f96f34c3bc162e

const authUser = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token! Please sign in again",
    });
  }

  try {

    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);
<<<<<<< HEAD
    const user = await User.findById(decodeToken.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. please signIn again",
      });
    }
    req.user = user;
=======

    if (!decodeToken || !decodeToken.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure. Please sign in again",
      });
    }

    const user = await User.findById(decodeToken.userId).select("role");
    req.user = {
      _id: decodeToken.userId,
      role: user?.role || "user"
    };

>>>>>>> dbc1d4f7fb5e51db8f7de34df5f96f34c3bc162e
    return next();

    return res.status(401).json({
      success: false,
      message: "Invalid token structure. Please sign in again",
    });

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please sign in again",
    });
  }
};

export default authUser;