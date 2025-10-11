import { ActivityLog } from "@/lib/models/ActivityLog";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Cart } from "@/lib/models/Cart";
import connectDB from "@/lib/db";
import { ok, badRequest } from "@/lib/response";

export async function GET() {
    await connectDB();

    try {
        // ---------- TOTALS ----------
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await User.countDocuments({ role: "client" });

        const totalRevenueData = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalRevenue = totalRevenueData[0]?.total || 0;

        // ---------- DAILY DATA ----------
        const dailyData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // ---------- MOST POPULAR ORDER DATA ----------
        const mostPopularOrders = await Cart.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalQuantity: { $sum: "$products.quantity" },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 0,
                    productId: "$product._id",
                    name: "$product.name",
                    totalQuantity: 1,
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
        ]);

        // ---------- ACTIVITY LOG ----------
        const activityLog = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "email username role")
            .lean();

        // ---------- RESPONSE ----------
        return ok({
            totals: {
                orders: totalOrders,
                revenue: totalRevenue,
                customers: totalCustomers,
            },
            dailyData,
            mostPopularOrders,
            activityLog,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return badRequest("Failed to fetch analytics: " + error);
    }
}
