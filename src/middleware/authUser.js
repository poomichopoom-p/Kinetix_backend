import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User } from "../modules/Model/user-model.js";
const authUser = async (req, res, next) => {
  // 1. Try cookie first, then Authorization header
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token! Please sign in again",
    });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const user = await User.findById(decodeToken.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. please signIn again",
      });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please sign in again",
    });
  }
};

export default authUser;

