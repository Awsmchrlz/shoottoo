const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: false,
    trim: true,
  },
  imageUrl: {
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
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  accountBalance: {
    type: Number,
    default: 0,
  },
  accountBalanceSignature: String,
  pin: {
    type: String,
    required: false,
    default:''
  },
  transactionSignature: {
    type: String,
  },
  transactions: [
    {
      transactionType: {
        type: String, // 'DEPOSIT' or 'WITHDRAWAL'
        enum: ["DEPOSIT", "WITHDRAWAL","GAME-ENTRY", "TRANSFER", "RECIEVE"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      transactionId:{
        type:String,
        required:true
      }
    },
  ],
});

// Hash the password before saving to the database

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// New method to create and verify transaction signature
userSchema.methods.createTransactionSignature = function () {
  const hash = crypto.createHash("sha256");
  hash.update(`${this.transactions}${this.pin}`);
  this.transactionSignature = hash.digest("hex");
};

// New method to update PIN
userSchema.methods.setPin = async function (newPin) {
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(newPin, salt);
  await this.save();
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

// Method to update and sign account balance
userSchema.methods.updateAccountBalance = async function (
  newBalance,
  secretKey
) {
  // Update account balance
  this.accountBalance = newBalance;

  // Create a hash of the account balance
  const hash = crypto.createHash("sha256");
  hash.update(`${this.accountBalance}${secretKey}`);
  const signature = hash.digest("hex");

  // Verify the signature before saving

  // Save the signature to the user's document
  this.accountBalanceSignature = signature;

  // Save the updated user
  await this.save();
};

// Method to verify account balance integrity
userSchema.methods.verifyAccountBalance = function (secretKey) {
  // Recreate the hash and compare with the stored signature
  const hash = crypto.createHash("sha256");
  hash.update(`${this.accountBalance}${secretKey}`);
  const recalculatedSignature = hash.digest("hex");

  return this.accountBalanceSignature === recalculatedSignature;
};




userSchema.methods.pushTransaction = function ({type, amount, timestamp, signature,transactionId}) {
  this.transactions.push({
    type, amount, signature,transactionId,
    timestamp: Date.now(),
    // Additional transaction details...
  });
}

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
