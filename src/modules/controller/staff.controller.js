import bcrypt from "bcrypt";
import { Staff } from "../Model/staff-model";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const doc = await Staff.create({
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