import jwt from "jsonwebtoken";
import { User } from "../Model/users-model.js";
import bcrypt from "bcrypt";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req, res, next) => {
  const { name, email, password, address } = req.body || "";
  const trimName = String(name || "").trim();
  const trimEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!trimName || !trimEmail || !password) {
    const err = new Error("name,surname,email,password,address  are requied!");
    err.success = false;
    err.name = "VaridationError";
    err.status = 404;
    err.message = "name,surname,email,password,address  are requied!";
    return next(err);
  }
  if (!EMAIL_PATTERN.test(trimEmail)) {
    const err = new Error("user");
    err.name = "WorngPattern";
    err.status = 400;
    err.message = "your write wrong Pattern";
    return next(err);
    // res.status(400).json({success:false,message:"worng pattern"})
  }

  try {
    const doc = await User.create({
      name: trimName,
      email: trimEmail,
      password,
      ...(address ? { address } : {}),
    });
    
  
    const safe = doc.toObject();
    delete safe.password;

    return res
      .status(201)
      .json({ success: true, message: "successful created!", data: safe });
  } catch (err) {
    const error = new Error("user");
    err.status = 404;
    err.message = "created fail !";
    res.status(400).json({ success: false, message: "error!", error: err });
    return next(error);
  }
};


export const login = async (req, res, next) => {
  const { email, password } = req.body || "";
  const userEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!userEmail || !password) {
    return res
      .status(400)
      .json({ success: false, message: "email or password not correct !" });
  }
  try {
    const user = await User.findOne({ userEmail }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: " worng password!! " });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "2h",
    });
    const isprod = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isprod,
      path: "/",
      maxAge: 120 * 120 * 2000,
    });
    return res.status(200).json({
      success: true,
      message: "Login success!",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        userRank: user.userRank,
      },
    });
  } catch (err) {
    next(err);
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