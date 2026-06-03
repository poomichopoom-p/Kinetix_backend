import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const authUser = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token! please signIn again",
    });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    if (!decodeToken) {
      req.user = { _id: decodeToken.userId };
      next();
    }

    req.user = { _id: userId };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. please signIn again",
    });
  }
};


export default authUser;

