const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }
      }
    ],
    shippingAddress: { type: String, required: true },
    notes: { type: String, default: '' },
    paymentMethod: { type: String, required: true }, // Cash or VodafoneCash
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'], default: 'Pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);