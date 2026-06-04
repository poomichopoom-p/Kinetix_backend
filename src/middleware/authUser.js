import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token! please signIn again",
    });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    req.user = { _id: decodeToken.userId };
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. please signIn again",
    });
  }
};

export default authUser;
