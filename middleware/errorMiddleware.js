// ==========================================
// 1. معالج المسارات غير الموجودة (404 Not Found)
// ==========================================
const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error); // تمرير الخطأ للدالة التالية
};

// ==========================================
// 2. معالج الأخطاء الشامل (Global Error Handler)
// ==========================================
const errorHandler = (err, req, res, next) => {
  // إذا كان كود الحالة 200 (نجاح) ولكن وصلنا هنا، نغيره لـ 500 (خطأ سيرفر)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // اصطياد خطأ الـ Mongoose الشهير (عندما يتم إرسال ID بصيغة غير صحيحة)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'العنصر غير موجود في قاعدة البيانات';
  }

  // إرسال الرد بصيغة JSON
  res.status(statusCode).json({
    message: message,
    // إخفاء مسار الخطأ (stack) في بيئة الإنتاج لزيادة الأمان
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };