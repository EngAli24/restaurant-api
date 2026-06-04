const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('jwt', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 1000
  });
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (user && (await user.matchPassword(password))) {
      generateTokenAndSetCookie(res, user._id, user.role);
      res.status(200).json({ _id: user._id, name: user.name, phone: user.phone, role: user.role, message: "تم تسجيل الدخول بنجاح" });
    } else {
      res.status(401).json({ message: "رقم الهاتف أو كلمة المرور غير صحيحة" });
    }
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: "رقم الهاتف مسجل بالفعل" });

    const user = await User.create({ name, phone, password, role });
    if (user) {
      generateTokenAndSetCookie(res, user._id, user.role);
      res.status(201).json({ _id: user._id, name: user.name, phone: user.phone, role: user.role, message: "تم إنشاء الحساب بنجاح" });
    } else {
      res.status(400).json({ message: "بيانات المستخدم غير صالحة" });
    }
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
};

// ==========================================
// مسارات البروفايل
// ==========================================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.status(200).json({ _id: user._id, name: user.name, phone: user.phone, role: user.role });
    } else {
      res.status(404).json({ message: "المستخدم غير موجود" });
    }
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// 💡 دالة التعديل (تم إزالة next والاعتماد على الرد المباشر)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      // إذا أراد المستخدم تغيير كلمة المرور
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
            return res.status(400).json({ message: "يرجى إدخال كلمة المرور الحالية" });
        }
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
        }
        user.password = req.body.newPassword;
      }

      const updatedUser = await user.save();
      res.status(200).json({ _id: updatedUser._id, name: updatedUser.name, phone: updatedUser.phone, role: updatedUser.role });
    } else {
      res.status(404).json({ message: "المستخدم غير موجود" });
    }
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// ==========================================
// إنشاء حساب عن طريق المدير
// ==========================================
const createUserByAdmin = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    
    const userExists = await User.findOne({ phone });
    if (userExists) return res.status(400).json({ message: "رقم الهاتف مسجل بالفعل مسبقاً" });

    const user = await User.create({ name, phone, password, role: role || 'user' });
    
    if (user) {
      res.status(201).json({ message: "تم إنشاء الحساب بنجاح", user: { _id: user._id, name: user.name, phone: user.phone, role: user.role } });
    } else {
      res.status(400).json({ message: "بيانات المستخدم غير صالحة" });
    }
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

module.exports = { loginUser, registerUser, logoutUser, getUserProfile, updateUserProfile, createUserByAdmin };