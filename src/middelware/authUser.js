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