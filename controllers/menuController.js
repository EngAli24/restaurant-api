const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    // 💡 التعديل هنا: أخذ الرابط المباشر من كلاوديناري بدون إضافة (/) أو استبدال
    let imageUrl = req.file ? req.file.path : (req.body.imageUrl || '');
    const category = await Category.create({ name, imageUrl });
    res.status(201).json(category);
  } catch (error) { next(error); }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) { next(error); }
};

const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, discount } = req.body;
    // 💡 التعديل هنا: أخذ الرابط المباشر من كلاوديناري
    let imageUrl = req.file ? req.file.path : (req.body.imageUrl || '');
    const menuItem = await MenuItem.create({ name, description, price, imageUrl, category, discount });
    res.status(201).json(menuItem);
  } catch (error) { next(error); }
};

const getMenuItems = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find().populate('category', 'name');
    res.status(200).json(menuItems);
  } catch (error) { next(error); }
};

const updateMenuItem = async (req, res, next) => {
  try {
    let updateData = req.body;
    // 💡 التعديل هنا: حفظ الرابط الجديد مباشرة في حالة تعديل الصورة
    if (req.file) updateData.imageUrl = req.file.path;
    
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });
    if (!updatedItem) return res.status(404).json({ message: "الوجبة غير موجودة" });
    res.status(200).json(updatedItem);
  } catch (error) { next(error); }
};

// 💡 الدالة الجديدة (الحذف)
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "الوجبة غير موجودة" });
    res.status(200).json({ message: "تم الحذف بنجاح" });
  } catch (error) { next(error); }
};

module.exports = { createCategory, getCategories, createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem };