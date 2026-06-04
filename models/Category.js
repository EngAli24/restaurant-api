const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'يرجى إدخال اسم الفئة'], 
    unique: true,
    trim: true 
  },
  imageUrl: { 
    type: String, 
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);