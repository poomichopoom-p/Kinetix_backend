import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Staff } from "../Model/staff-model.js";
import jwt from "jsonwebtoken";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/staff
export const getAllStaff = async (req, res, next) => {
  const { role } = req.query;
  const filter = { is_active: true };
  if (role) filter.role = role;

  try {
    const staffList = await Staff.find(filter);
    return res.status(200).json({ count: staffList.length, data: staffList });
  } catch (err) {
    next(err);
  }
};

// GET /api/staff/:staffId
export const getStaffById = async (req, res, next) => {
  const { staffId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    return res.status(400).json({ message: "Invalid staff ID" });
  }

  try {
    let query = Staff.findById(staffId);

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }

    const staffMember = await query;

    if (!staffMember) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({ data: staffMember });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/staff/:id
export const updateStaff = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid staff ID" });
  }

  // Whitelist allowed fields — ignore anything else sent in the body
  const { name, email, phone, role, is_active } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (role !== undefined) updateData.role = role;
  if (is_active !== undefined) updateData.is_active = is_active;

  try {
    const updated = await Staff.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const registerStaff = async (req, res, next) => {
  const { name, surname, email, password, address } = req.body || {};

  const trimName = String(name || "").trim();
  const trimSurname = String(surname || "").trim();
  const trimEmail = String(email || "")
    .trim()
    .toLowerCase();
  // console.log(trimName, trimEmail, password, trimSurname, address);

  if (!trimName || !trimSurname || !trimEmail || !password) {
    const err = new Error("name, surname, email, password are required!");
    err.success = false;
    err.name = "ValidationError";
    err.status = 400;
    return next(err);
  }

  if (!EMAIL_PATTERN.test(trimEmail)) {
    const err = new Error("Invalid email pattern");
    err.name = "ValidationError";
    err.status = 400;
    return next(err);
  }

  try {
    const doc = await Staff.create({
      name: trimName,
      surname: trimSurname,
      email: trimEmail,
      password: password,
      ...(address ? { address } : {}),
      role: "admin",
    });

    // const safe = doc.toObject();
    // delete safe.password;

    return res.status(201).json({
      success: true,
      message: "Staff created successfully!",
      data: doc,
    });
  } catch (err) {
    if (err.code === 11000) {
      const dupErr = new Error("Email already exists");
      dupErr.name = "DuplicateError";
      dupErr.status = 409;
      dupErr.message = "This email is already registered";
      return next(dupErr);
    }

    // err.status = 500;
    // err.message = "Failed to create staff";
    return next(err);
  }
};

export const staffLogin = async (req, res, next) => {
  const { email, password } = req.body || {};
  const staffEmail = String(email || "")
  .trim()
  .toLowerCase();
  if (!staffEmail || !password) {
    return res
      .status(400)
      .json({ success: false, message: " Email and Password are required" });
  }
  try {
    const staff = await Staff.findOne({ email: staffEmail }).select("+password");
    console.log(staff);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, meassge: "account not found!" });
    }
    const isMatch = await bcrypt.compare(password,staff.password);
    // console.log(isMatch)
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: " worng password!! " });
    }

    const token = jwt.sign(
      { staffId: staff._id },
      process.env.JWT_STAFF_SECRETKEY,
      {
        expiresIn: "2h",
      },
    );
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
      staff: {
        _id: staff._id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
      },
    });
  } catch (err) {
    // err.name = "server Error"
    next(err);
  }
};
