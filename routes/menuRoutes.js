const express = require('express');
const router = express.Router();
const { createCategory, getCategories, createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 

router.get('/categories', getCategories);
router.post('/categories', protect, admin, upload.single('image'), createCategory);

router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById); 
router.post('/items', protect, admin, upload.single('image'), createMenuItem);
router.put('/items/:id', protect, admin, upload.single('image'), updateMenuItem);
router.delete('/items/:id', protect, admin, deleteMenuItem);

module.exports = router;