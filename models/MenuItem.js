const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String,
      default: '' 
    },
    price: { 
      type: Number, 
      required: true 
    },
    imageUrl: { 
      type: String, 
      default: '' // الصورة أصبحت اختيارية
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category', 
      required: true 
    },
    discount: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);