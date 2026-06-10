/*import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const authStaff = async (req, res, next) => {
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
      message: "Access denied. No token! please signIn again",
    });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_STAFF_SECRETKEY);
    // staffLogin uses staffId in the payload
    req.staff = { _id: decodeToken.staffId };
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired staff token. please signIn again",
    });
  }
};

export default authStaff;
*/