import jwt from "jsonwebtoken";

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

    if (decodeToken && decodeToken.userId) {
      // Safely register identity metadata matching your token signature key
      req.user = { _id: decodeToken.userId };
      return next(); // 'return' guarantees processing context exits clean here
    }

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