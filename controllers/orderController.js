const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, notes, paymentMethod, totalPrice, customerName, customerPhone } = req.body;
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: "سلة الطلبات فارغة" });

    const userId = req.user ? req.user._id : null;
    const order = await Order.create({ user: userId, customerName, customerPhone, orderItems, shippingAddress, notes, paymentMethod, totalPrice });
    res.status(201).json(order);
  } catch (error) { res.status(500).json({ message: "خطأ", error: error.message }); }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('orderItems.menuItem', 'name price').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: "خطأ", error: error.message }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after', runValidators: true });
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.status(200).json(order);
  } catch (error) { res.status(500).json({ message: "خطأ", error: error.message }); }
};

const getOrderStats = async (req, res) => {
  try {
    const topItems = await Order.aggregate([
      { $match: { orderItems: { $exists: true, $ne: [] } } },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.name', totalSold: { $sum: '$orderItems.quantity' } } },
      { $sort: { totalSold: -1 } }
    ]);

    // التجميع باستخدام (الاسم والرقم) معاً للحصول على تفاصيل دقيقة
    const allCustomers = await Order.aggregate([
      { $match: { customerPhone: { $exists: true, $ne: "", $ne: null } } },
      { $group: { 
          _id: { phone: "$customerPhone", name: "$customerName" }, 
          totalOrders: { $sum: 1 }, 
          totalSpent: { $sum: "$totalPrice" },
          isRegistered: { $max: { $cond: [{ $ne: ["$user", null] }, true, false] } }
        } 
      },
      { $sort: { totalOrders: -1, totalSpent: -1 } }
    ]);

    res.status(200).json({ topItems, allCustomers });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات", error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الطلبات", error: error.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, getOrderStats, getMyOrders };