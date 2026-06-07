const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, createUserByAdmin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware'); // 💡 تم استدعاء admin هنا

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.post('/create-user', protect, admin, createUserByAdmin);

module.exports = router;