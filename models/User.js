const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  emailVerified:{
    type:Boolean,
    default:false,
  },
  verificationToken:{
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: false,
    trim: true,
  },
  friends:{
    type:Array,
    required:false
  },
  imageUrl:{
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
    unique: false,
  },
  privateKey: {
    type: String,
    required: true,
    unique: false,
  },
  password: {
    type: String,
    required: true,
  },
  // Additional attributes can be added as needed
  // ...

  // Timestamps for created and updated
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') || user.isNew) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      return next();
    } catch (err) {
      return next(err);
    }
  } else {
    return next();
  }
  
});


// Method to compare passwords during login
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};


/// Method to set image url
userSchema.methods.setImageUrl = async function (newImageUrl) {
  try {
    // Update the imageUrl attribute
    this.imageUrl = newImageUrl;

    // Save the updated user
    await this.save();
  } catch (err) {
    throw new Error(err);
  }
};


const User = mongoose.model('User', userSchema);

module.exports = User;
