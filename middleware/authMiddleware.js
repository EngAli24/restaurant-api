const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==========================================
// 1. حارس المصادقة (التأكد من تسجيل الدخول)
// ==========================================
const protect = async (req, res, next) => {
  let token;

  // محاولة قراءة التوكن من الكوكيز
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "غير مصرح لك بالوصول، يرجى تسجيل الدخول أولاً" });
  }

  try {
    // فك تشفير التوكن والتأكد من صحته باستخدام المفتاح السري
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // البحث عن المستخدم في قاعدة البيانات بناءً على الـ ID الموجود في التوكن
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: "هذا الحساب لم يعد موجوداً" });
    }

    // السماح بالمرور للمسار المطلوب
    next();
  } catch (error) {
    res.status(401).json({ message: "التوكن غير صالح أو انتهت صلاحيته", error: error.message });
  }
};

// ==========================================
// 2. حارس الصلاحيات (التأكد من أن المستخدم مدير)
// ==========================================
const admin = (req, res, next) => {
  // نتأكد أولاً أن المستخدم موجود (عدى من حارس المصادقة)، وأن صلاحيته 'admin'
  if (req.user && req.user.role === 'admin') {
    next(); // السماح بالمرور
  } else {
    res.status(403).json({ message: "غير مصرح لك! هذا المسار مخصص للمديرين فقط" });
  }
};

// ==========================================
// 3. حارس المصادقة الاختيارية (للسماح للزوار)
// ==========================================
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // إذا كان هناك توكن، سنحاول قراءته لمعرفة المستخدم
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // إذا كان التوكن غير صالح، سنتجاهله ونتعامل معه كزائر
    }
  }
  
  // في كل الحالات (سواء قرأنا اليوزر أو لا)، سنسمح بالمرور
  next();
};

module.exports = { protect, admin, optionalAuth };