const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // الاتصال بقاعدة البيانات باستخدام الرابط الموجود في ملف .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // إغلاق التطبيق في حالة الفشل
  }
};

module.exports = connectDB;