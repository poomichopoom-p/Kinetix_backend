import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User } from "../modules/Model/users-model.js";
const authUser = async (req, res, next) => {
  let token = req.cookies?.accessToken;

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