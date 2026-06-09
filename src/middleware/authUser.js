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