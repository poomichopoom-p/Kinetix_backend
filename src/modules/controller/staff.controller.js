import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { staff } from "../Model/staff-model.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const updated = await staff.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

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
  const trimEmail = String(email || "").trim().toLowerCase();

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
    const doc = await staff.create({
      name: trimName,
      surname: trimSurname,
      email: trimEmail,
      password,
      ...(address ? { address } : {}),
      role: "staff",
    });

    const safe = doc.toObject();
    delete safe.password;

    return res.status(201).json({
      success: true,
      message: "Staff created successfully!",
      data: safe,
    });
  } catch (err) {
    if (err.code === 11000) {
      const dupErr = new Error("Email already exists");
      dupErr.name = "DuplicateError";
      dupErr.status = 409;
      dupErr.message = "This email is already registered";
      return next(dupErr);
    }

    err.status = 500;
    err.message = "Failed to create staff";
    return next(err);
  }
};
