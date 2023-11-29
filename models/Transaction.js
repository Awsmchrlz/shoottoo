const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const TransactionSchema = new mongoose.Schema({
  transactionStatus: {
    type: String,
    enum: ["initiated", "approved", "completed", "failed"],
    default: "initiated",
  },
  transactionLink: {
    type: String,
    required: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  timeStamp: {
    type: String,
    default: "",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  gameLink: {
    type: String,
    required: false,
    default: "",
  },
});

// Static method to create a new Transaction
TransactionSchema.statics.createTransaction = async function (transactionData) {
  try {
    const newTransaction = await this.create(transactionData);
    return newTransaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

TransactionSchema.pre("save", async function (next) {
  const Transaction = this;
  const saltRounds = 10; // Increasing rounds increases hashing time

  try {
    // if (Transaction.isModified('password')) {
    //   const hashedPassword = await bcrypt.hash(Transaction.password, saltRounds);
    //   Transaction.password = hashedPassword;
    // }
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method to update a Transaction
TransactionSchema.methods.updateTransaction = async function (updateData) {
  try {
    Object.assign(this, updateData);
    this.updatedAt = Date.now();
    await this.save();
    return this;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Instance method to remove a Transaction
TransactionSchema.methods.removeTransaction = async function () {
  try {
    await this.remove();
  } catch (error) {
    throw new Error(error.message);
  }
};

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
