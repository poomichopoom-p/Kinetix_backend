import mongoose from "mongoose";
import { staff } from "../Model/staff-model.js";

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
        new: true,          // return the document after update
        runValidators: true // enforce schema validation on update
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
