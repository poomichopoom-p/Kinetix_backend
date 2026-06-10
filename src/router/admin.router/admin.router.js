<<<<<<< HEAD
// router/admin.router.js
=======
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a
import { Router } from "express";
import authUser from "../../middleware/authUser.js";
import isAdmin from "../../middleware/isAdmin.js";
import { Order } from "../../modules/Model/Orders-model.js";
import { User } from "../../modules/Model/user-model.js";
import { Products } from "../../modules/Model/products-model.js";

export const adminRouter = Router();


adminRouter.use(authUser, isAdmin);

<<<<<<< HEAD
=======
adminRouter.get("/test", (req, res) => {
    res.json({ success: true, message: "Admin router working!" });
});
>>>>>>> 1a91f3a1719f142fe56c895ac92eb143bd0e890a

// UPDATED: Get dashboard stats
adminRouter.get("/stats", async (req, res, next) => {
    try {
        // 1. Total Orders - count ALL orders from ALL users
        const totalOrders = await Order.countDocuments();

        // 2. Pending Orders - orders waiting for confirmation
        const pendingOrders = await Order.countDocuments({ status: "pending" });

        // 3. Total Customers - count ALL users (not staff)
        const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

        // 4. Active Shoes (Currently rented) - count orders with status "active" or "rented"
        // This tracks shoes that are currently rented out
        const activeRentals = await Order.countDocuments({
            status: { $in: ["active", "rented", "shipped"] }
        });

        // Alternative: Get total quantity of rented shoes (if one order has multiple shoes)
        const activeShoesQuantity = await Order.aggregate([
            { $match: { status: { $in: ["active", "rented", "shipped"] } } },
            { $unwind: "$items" },
            { $group: { _id: null, total: { $sum: "$items.quantity" } } }
        ]);

        const activeShoes = activeShoesQuantity[0]?.total || activeRentals;

        // 5. Total Revenue - sum of all completed orders
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $in: ["completed", "returned", "done"] } } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ]);

        res.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                totalUsers,
                activeShoes,
                totalRevenue: totalRevenue[0]?.total || 0,
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get all orders (for admin to see)
adminRouter.get("/orders", async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate("userId", "name email phone")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
});

// Get currently active rentals (shoes currently rented)
adminRouter.get("/active-rentals", async (req, res, next) => {
    try {
        const activeRentals = await Order.find({
            status: { $in: ["active", "rented", "shipped"] }
        })
            .populate("userId", "name email phone")
            .populate("items.productId", "modelName brand images")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: activeRentals });
    } catch (err) {
        next(err);
    }
});

// Get all users (for admin)
adminRouter.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
});



/*adminRouter.get("/test", (req, res) => {
    res.json({ success: true, message: "Admin router working!" });
});

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


// Get all users with pagination and filters
adminRouter.get("/users", async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search = "", rank } = req.query;

        // Build filter
        let filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { surname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        if (rank && rank !== "all") {
            filter.userRank = rank;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password")  // Don't send passwords
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get single user by ID (for admin)
adminRouter.get("/users/:userId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// Get user rental history (for admin)
adminRouter.get("/users/:userId/rentals", async (req, res, next) => {
    try {
        const rentals = await Rental.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .populate("productId", "modelName brand");

        res.json({ success: true, data: rentals });
    } catch (err) {
        next(err);
    }
});

// Update user rank (bronze, silver, gold, etc.)
adminRouter.patch("/users/:userId/rank", async (req, res, next) => {
    try {
        const { rank } = req.body;
        const validRanks = ["bronze", "silver", "gold", "platinum", "Diamond"];

        if (!validRanks.includes(rank)) {
            return res.status(400).json({ success: false, message: "Invalid rank" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { userRank: rank },
            { new: true }
        ).select("-password");

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});
*/