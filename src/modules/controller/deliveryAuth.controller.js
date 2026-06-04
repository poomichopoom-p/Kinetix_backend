import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DeliveryUser } from "../Model/DeliveryUser-model.js";

export const register = async (req, res, next) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password, role are required" });
  }
  if (!["USER", "DRIVER", "ADMIN"].includes(role)) {
    return res.status(400).json({ message: "role must be USER, DRIVER, or ADMIN" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await DeliveryUser.create({ name, email: email.toLowerCase(), password: hashed, role });
    const safe = user.toObject();
    delete safe.password;
    return res.status(201).json({ data: safe });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await DeliveryUser.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRETKEY,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await DeliveryUser.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};
