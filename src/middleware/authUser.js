import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User } from "../modules/Model/users-model.js";
const authUser = async (req, res, next) => {
  let token = req.cookies?.accessToken;
}

import { User } from "../modules/Model/user-model.js";   // 🔥 make sure this import is here

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
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure. Please sign in again",
      });
    }

    const user = await User.findById(decoded.userId).select("role");
    req.user = {
      _id: decoded.userId,
      role: user?.role || "user",
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please sign in again",
    });
  }
};

export default authUser;

/*import jwt from "jsonwebtoken";
>>>>>>> 69974be (Fix2ndFromYok)

  // Check for Authorization header if cookie is not present
  if (!token && req.headers.authorization) {
    if (req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
  }

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

>>>>>>> 69974be (Fix2ndFromYok)
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please sign in again",
    });
  }
};

export default authUser;
*/