import jwt from "jsonwebtoken";
import { User } from "../Model/users-model.js";
import bcrypt from "bcrypt";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req, res, next) => {
  const { name, surname, email, password, address } = req.body || "";
  const trimName = String(name || "").trim();
  const trimSurname = String(surname || "").trim();
  const trimEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!trimName || !trimSurname || !trimEmail || !password) {
    const err = new Error("name, surname, email, password, address are required!");
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
      surname: trimSurname,
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
    const error = new Error("created fail !");
    error.status = 400;
    error.message = "created fail !";
    // Respond with the original error details for debugging, but pass a normalized error to next()
    res.status(400).json({ success: false, message: "error!", error: err?.message || err });
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
    if (!isValidUserId(req, res)) return;

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own user data",
      });
    }

    const user = await User.findById(req.params.id);

    err.message = "created fail !";
    res.status(400).json({ success: false, message: "error!", error: err });
    return next(error);
  }catch(err){
    next(err)
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
