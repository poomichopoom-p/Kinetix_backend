import jwt from "jsonwebtoken";
import { User } from "../Model/user-model.js";
import { Order } from "../Model/Orders-model.js";
import bcrypt from "bcrypt";

<<<<<<< HEAD
// ถ้าไฟล์นี้อยู่คนละ path ให้ปรับ import เป็น:
// import { User } from "../../modules/users-model.js";

=======
>>>>>>> 59678a2 (update checkout)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => {
  const userObject = user.toObject();
  // Ensure password never leaks downstream to the UI layer
  delete userObject.password;
  return userObject;
};

const applySelect = (query, fields) => {
  if (query && typeof query.select === "function") {
    return query.select(fields);
  }
  return query;
};

const getRequestUserId = (req) => req.params.id || req.params._id;

const isOwner = (req) => {
  return req.user?._id?.toString() === getRequestUserId(req);
};

const isValidUserId = (req, res) => {
  const userId = getRequestUserId(req);
  if (/^[0-9a-fA-F]{24}$/.test(userId)) {
    return true;
  }
  res.status(400).json({
    success: false,
    message: "Invalid user id",
  });
  return false;
};

export const login = async (req, res, next) => {
  const { email, password } = req.body || {};
  const userEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!userEmail || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required!" });
  }
  try {
<<<<<<< HEAD
=======
    // FIX: Match against schema key 'email' instead of variable name 'userEmail'
>>>>>>> 59678a2 (update checkout)
    const user = await User.findOne({ email: userEmail }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong password!!" });
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
      accessToken: token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        address: user.address,
        role: user.role || "user",
        userRank: user.userRank,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  const { name, surname, email, password, address } = req.body || {};
  const trimName = String(name || "").trim();
  const trimSurname = String(surname || "").trim();
  const trimEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!trimName || !trimSurname || !trimEmail || !password) {
<<<<<<< HEAD
    const err = new Error(
      "name, surname, email, password, address are required!",
    );
    err.success = false;
    err.name = "VaridationError";
    err.status = 404;
    err.message = "name,surname,email,password,address  are requied!";
=======
    const err = new Error("Name, surname, email, and password are required!");
    err.status = 400;
>>>>>>> 59678a2 (update checkout)
    return next(err);
  }

  if (!EMAIL_PATTERN.test(trimEmail)) {
    const err = new Error("Invalid email format pattern.");
    err.status = 400;
    return next(err);
  }

  try {
    const doc = await User.create({
      name: trimName,
      surname: trimSurname,
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
    err.status = 400;
    return next(err);
  }
};
// poom Fix get user by id
export const GetById = async (req, res, next) => {
  const _id = getRequestUserId(req);

  if (!_id) {
    return res.status(400).json({
      success: false,
      message: "User id is required",
    });
  }

  try {
    const user = await applySelect(User.findById(_id), "-cart");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ID Not found!",
      });
    }

    return res.status(200).json({ success: true, message: false, data: user });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await applySelect(
      User.findById(req.user._id),
      "-password -cart",
    );
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

export const getUserStats = async (req, res, next) => {
  try {
    const totalRentals = await Orders.countDocuments({
      customerId: req.user._id,
    });
    const activeRentals = await Orders.countDocuments({
      customerId: req.user._id,
      is_active: true,
      status: { $nin: ["Done", "Fail"] },
    });
    const returned = await Orders.countDocuments({
      customerId: req.user._id,
      status: { $in: ["returning", "Done", "Fail"] },
    });
    const returnScore =
      totalRentals === 0
        ? 100
        : Math.max(
            0,
            Math.round(((totalRentals - returned) / totalRentals) * 100),
          );

    return res.status(200).json({
      success: true,
      data: {
        totalRentals,
        activeRentals,
        returnScore,
        points: req.user.points || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserRewards = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const ranks = {
      bronze: { next: "silver", nextPoints: 1000 },
      silver: { next: "gold", nextPoints: 2000 },
      gold: { next: "platinum", nextPoints: 5000 },
      platinum: { next: "Diamond", nextPoints: 10000 },
      Diamond: { next: "Legend", nextPoints: 20000 },
    };

    const currentRankInfo = ranks[user.userRank] || ranks.bronze;

    return res.status(200).json({
      success: true,
      data: {
        points: user.points || 0,
        level: user.userRank,
        nextLevel: currentRankInfo.next,
        nextLevelPoints: currentRankInfo.nextPoints,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const redeemPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);

    if (user.points < points) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points",
      });
    }

    user.points -= points;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Points redeemed successfully",
      remaining: user.points,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "surname",
      "email",
      "password",
      "address",
      "phone",
      "avatarUrl",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    console.log(updates)

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

    const user = await User.findById(req.user._id).select("+password");

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

export const getUserById = async (req, res, next) => {
  try {
    if (!isValidUserId(req, res)) return;

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own user data",
      });
    }

<<<<<<< HEAD
    const userId = getRequestUserId(req);
    const user = await applySelect(User.findById(userId), "-password");

=======
    const user = await User.findById(req.params.id);
>>>>>>> 59678a2 (update checkout)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

<<<<<<< HEAD
=======
    // FIX: Removed duplicate login code block (bcrypt/cookie setting) here
>>>>>>> 59678a2 (update checkout)
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dbc1d4f (fixing 01)
    const allowedFields = [
      "name",
      "surname",
      "email",
      "password",
      "address",
      "phone",
      "avatarUrl",
    ];

=======
    const allowedFields = ["name", "surname", "email", "password", "address"];
>>>>>>> 59678a2 (update checkout)
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

<<<<<<< HEAD
    // ✅ ใช้ findById + save เพื่อให้ mongoose middleware ทำงาน
    // สำคัญมากถ้ามี pre("save") สำหรับ hash password
    const userId = getRequestUserId(req);
    const user = await applySelect(User.findById(userId), "+password");

=======
    const user = await User.findById(req.params.id).select("+password");
>>>>>>> 59678a2 (update checkout)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    Object.assign(user, updates);
    await user.save({ validateModifiedOnly: true });

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

<<<<<<< HEAD
    const userId = getRequestUserId(req);
    const user = await User.findByIdAndDelete(userId);

=======
    const user = await User.findByIdAndDelete(req.params.id);
>>>>>>> 59678a2 (update checkout)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dbc1d4f (fixing 01)
};


export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No active session found.",
      });
    }

    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (err) {
    next(err);
  }
};
=======
};
>>>>>>> 59678a2 (update checkout)
