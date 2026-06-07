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
    hasSizes: { 
      type: Boolean, 
      default: false 
    },
    sizes: { 
      small: { type: Number, default: null },
      medium: { type: Number, default: null },
      large: { type: Number, default: null }
    },
    imageUrl: { 
      type: String, 
      default: '' 
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