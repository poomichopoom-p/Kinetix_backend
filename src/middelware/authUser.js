import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token! please signIn again",
    });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodeToken.userId || decodeToken.id || decodeToken._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload. please signIn again",
      });
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
