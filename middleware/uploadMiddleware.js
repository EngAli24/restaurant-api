const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// إعدادات الاتصال بحسابك
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// إعدادات التخزين على كلاوديناري
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant_menu', // اسم الفولدر اللي هيتكريت أوتوماتيك هناك
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  }
});

const upload = multer({ storage: storage });

module.exports = upload;