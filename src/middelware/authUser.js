import jwt from "jsonwebtoken";

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
export default authUser;



// const verifyLogin = (req, res, next) => {
//   // ดึง Token จาก Header หรือ Cookies
//   const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
//   if (!token) {
//     return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนชำระเงิน" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // ฝังข้อมูล user เข้าไปใน req เพื่อให้ controller เอาไปใช้ต่อได้
//     next(); // ผ่านกุญแจด่านนี้ ไปทำขั้นตอนต่อไป
//   } catch (error) {
//     return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
//   }
// };

// export default verifyLogin;
