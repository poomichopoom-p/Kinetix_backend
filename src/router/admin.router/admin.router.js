// router/admin.router.js
import { Router } from "express";
import authUser from "../middleware/authUser.js";
import isAdmin from "../middleware/isAdmin.js";
import { Order } from "../modules/Model/Orders-model.js";
import { User } from "../modules/Model/users-model.js";
import { Products } from "../modules/Model/products-model.js";

export const adminRouter = Router();


adminRouter.use(authUser, isAdmin);


adminRouter.get("/orders", async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
});


adminRouter.get("/users", async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
});


adminRouter.patch("/orders/:id/status", async (req, res, next) => {
    const { status } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
});


adminRouter.get("/stats", async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const totalUsers = await User.countDocuments();
        const totalProducts = await Products.countDocuments();

        res.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                totalUsers,
                totalProducts,
            }
        });
    } catch (err) {
        next(err);
    }
});