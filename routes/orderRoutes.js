const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getOrderStats, getMyOrders } = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createOrder);

router.get('/myorders', protect, getMyOrders);

router.get('/stats', protect, admin, getOrderStats);
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;