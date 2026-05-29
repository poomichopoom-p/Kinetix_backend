import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  let token = req.cookie.accessToken;
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token! please signIn again",
    });
  }
  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    if (!decodeToken) {
      req.user = { _id: decodeToken.userId };
      next()
    }
  } catch (err) {
    next(err);
  }
};
export default authUser;