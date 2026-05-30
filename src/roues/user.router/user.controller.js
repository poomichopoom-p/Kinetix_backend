import {User} from "../../modules/users-model.js";

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
    err.status = 400;
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
    // res.status(400).json({success:false,message:"error!",error:err})
    next(err);
  }
};
