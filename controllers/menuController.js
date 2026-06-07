const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
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
    const { name, description, price, category, discount, hasSizes, priceSmall, priceMedium, priceLarge } = req.body;
    let imageUrl = req.file ? req.file.path : (req.body.imageUrl || '');
    
    // تجهيز البيانات مع الأحجام
    const itemData = {
      name, description, price: price || 0, imageUrl, category, discount,
      hasSizes: hasSizes === 'true' || hasSizes === true,
      sizes: {
        small: priceSmall ? Number(priceSmall) : null,
        medium: priceMedium ? Number(priceMedium) : null,
        large: priceLarge ? Number(priceLarge) : null
      }
    };

    const menuItem = await MenuItem.create(itemData);
    res.status(201).json(menuItem);
  } catch (error) { next(error); }
};

const getMenuItems = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find().populate('category', 'name');
    res.status(200).json(menuItems);
  } catch (error) { next(error); }
};

// 💡 دالة جديدة لجلب منتج واحد بالـ ID (عشان صفحة المنتج)
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) return res.status(404).json({ message: "الوجبة غير موجودة" });
    res.status(200).json(item);
  } catch (error) { next(error); }
};

const updateMenuItem = async (req, res, next) => {
  try {
    let updateData = { ...req.body };
    if (req.file) updateData.imageUrl = req.file.path;
    
    // تحديث الأحجام لو اتبعتت
    if (req.body.hasSizes !== undefined) {
      updateData.hasSizes = req.body.hasSizes === 'true' || req.body.hasSizes === true;
      updateData.sizes = {
        small: req.body.priceSmall ? Number(req.body.priceSmall) : null,
        medium: req.body.priceMedium ? Number(req.body.priceMedium) : null,
        large: req.body.priceLarge ? Number(req.body.priceLarge) : null
      };
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });
    if (!updatedItem) return res.status(404).json({ message: "الوجبة غير موجودة" });
    res.status(200).json(updatedItem);
  } catch (error) { next(error); }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "الوجبة غير موجودة" });
    res.status(200).json({ message: "تم الحذف بنجاح" });
  } catch (error) { next(error); }
};

module.exports = { createCategory, getCategories, createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem };