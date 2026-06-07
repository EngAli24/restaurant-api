const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true,
      match: [/^\d{11}$/, 'رقم الهاتف يجب أن يتكون من 11 رقماً'] 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    }
  },
  { timestamps: true }
);

// مقارنة كلمة المرور عند تسجيل الدخول
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; 
  }

  // لو كلمة المرور جديدة، نقوم بتشفيرها
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);