import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../Model/users-model.js";
// ถ้าไฟล์นี้อยู่คนละ path ให้ปรับ import เป็น:
// import { User } from "../../modules/users-model.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => {
  const userObject = user.toObject();

  // ✅ ห้ามส่ง password กลับไป frontend
  delete userObject.password;

  return userObject;
};

const isOwner = (req) => {
  return req.user?._id?.toString() === req.params.id;
};

const isValidUserId = (req, res) => {
  if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return true;
  }

  res.status(400).json({
    success: false,
    message: "Invalid user id",
  });

  return false;
};

export const registerUser = async (req, res, next) => {
  // ❌ req.body || "" ไม่ควรใช้ string
  // ✅ ควรใช้ req.body || {}
  const { name, email, password, address } = req.body || {};

  const trimName = String(name || "").trim();
  const trimEmail = String(email || "").trim().toLowerCase();

  // ❌ message บอก surname/address required แต่โค้ดไม่ได้เช็ค surname/address
  // ✅ แก้ message ให้ตรงกับ field ที่เช็คจริง
  if (!trimName || !trimEmail || !password) {
    const err = new Error("name, email, password are required!");
    err.success = false;

    // ❌ พิมพ์ผิด VaridationError
    // ✅ ValidationError
    err.name = "ValidationError";

    err.status = 400;
    err.message = "name, email, password are required!";
    return next(err);
  }

  if (!EMAIL_PATTERN.test(trimEmail)) {
    const err = new Error("Invalid email pattern");

    // ❌ WorngPattern พิมพ์ผิด
    // ✅ WrongPattern หรือ ValidationError
    err.name = "WrongPattern";

    err.status = 400;
    err.message = "Invalid email format";
    return next(err);
  }

  try {
    // ⚠️ ต้องเช็คใน users-model ว่ามี pre("save") hash password หรือยัง
    // ถ้ายังไม่มี ตรงนี้จะบันทึก password แบบ plain text อันตรายมาก
    const doc = await User.create({
      name: trimName,
      email: trimEmail,
      password,
      ...(address ? { address } : {}),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: sanitizeUser(doc),
    });
  } catch (err) {
    // ❌ ตรงนี้ของเดิมสร้าง error ตัวใหม่ แต่ไปแก้ err ตัวเก่า
    // ✅ ควรส่ง err ตัวจริงไปให้ error middleware
    err.status = 400;
    err.message = err.message || "Create user failed";
    return next(err);
  }
};

export const login = async (req, res, next) => {
  // ❌ req.body || "" ไม่ควรใช้
  // ✅ ใช้ {}
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const trimEmail = String(email).trim().toLowerCase();

    // ❌ ตรงนี้ผิดมาก: mongoose.findOne ไม่มี
    // const user = await mongoose.findOne({ email }).select("+password");

    // ✅ ต้องใช้ User.findOne
    const user = await User.findOne({ email: trimEmail }).select("+password");

    if (!user) {
      // ✅ ปกติ login ไม่ควรบอกชัดว่า user ไม่มี
      // เพราะเรื่อง security ควรตอบกลาง ๆ
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ❌ ชื่อ env ต้องเช็คว่าใน .env ใช้ JWT_SECRETKEY หรือ JWT_SECRET
    // ✅ ถ้าโปรเจกต์ใช้ JWT_SECRETKEY อยู่ ก็ใช้ชื่อนี้ต่อได้
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRETKEY,
      { expiresIn: "2h" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,

      // ❌ secure ต้องเป็น boolean ไม่ใช่ "none" หรือ "lax"
      // secure: isProd ? "none" : "lax",

      // ✅ production ใช้ true, local ใช้ false
      secure: isProd,

      // ✅ sameSite ถึงจะใช้ "none" หรือ "lax"
      sameSite: isProd ? "none" : "lax",

      path: "/",

      // ❌ 120 * 120 * 2000 แปลกมาก
      // ✅ 2 ชั่วโมง = 2 * 60 * 60 * 1000
      maxAge: 2 * 60 * 60 * 1000,
    });

    const safeUser = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: "Login success!",
      user: {
        _id: safeUser._id,
        email: safeUser.email,
        name: safeUser.name,
        userRank: safeUser.userRank,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    if (!isValidUserId(req, res)) return;

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own user data",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    if (!isValidUserId(req, res)) return;

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own user data",
      });
    }

    const allowedFields = ["name", "surname", "email", "password", "address"];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.email) {
      updates.email = String(updates.email).trim().toLowerCase();

      if (!EMAIL_PATTERN.test(updates.email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
    }

    if (updates.name) {
      updates.name = String(updates.name).trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // ✅ ใช้ findById + save เพื่อให้ mongoose middleware ทำงาน
    // สำคัญมากถ้ามี pre("save") สำหรับ hash password
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    Object.assign(user, updates);

    await user.save({
      validateModifiedOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Update user success",
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    if (!isValidUserId(req, res)) return;

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.clearCookie("accessToken");

    return res.status(200).json({
      success: true,
      message: "Delete user success",
    });
  } catch (err) {
    next(err);
  }
};