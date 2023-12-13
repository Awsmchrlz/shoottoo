const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require('./User')
const Game = require('./game')

const TransactionSchema = new mongoose.Schema({
  transactionStatus: {
    type: String,
    enum: ["initiated", "approved", "completed", "failed"],
    default: "initiated",
  },
  transactionType:{
    type:String,
    enum: ["DEPOSIT", "WITHDRAWAL","GAME-ENTRY", "TRANSFER", "RECIEVE"],
 required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
  signature:{
    type:String,
    required:true
  },
  transactionToken:{
    type:String,
    required:true
  },
  senderId:{
    type:String,
    required:true
  },
  recipientId:{
    type:String,
    required:true
  },
  amount:{
    type:String,
    required:true
  }
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


TransactionSchema.methods.processTransfer = async function (signatureKey) {
  try {
    const sender = await User.findOne({phoneNumber:this.senderId});
    const recipient = await User.findOne({phoneNumber:this.recipientId});

    // Verify integrity using signature key
    const isIntegrityValid = this.verifyIntegrity(signatureKey, sender, recipient);
    if (!isIntegrityValid) {
      throw new Error('Transaction integrity compromised.');
    }

    // Transfer funds from sender to recipient
    sender.updateAccountBalance(-this.amount, signatureKey);
    recipient.updateAccountBalance(this.amount, signatureKey);

    // Update transaction status to completed
    this.transactionStatus = 'completed';
    this.updatedAt = Date.now();
    await this.save();

    return this;
  } catch (error) {
    throw new Error(error.message);
  }
};

TransactionSchema.methods.verifyIntegrity = function (signatureKey, sender, recipient) {
  try {
    const hash = crypto.createHash('sha256');

    if(sender && recipient){
      // Verify integrity of sender's account balance
    hash.update(`${sender.accountBalance}${signatureKey}`);
    const senderIntegrity = hash.digest('hex') === sender.accountBalanceSignature;

    
   
     // Verify integrity of recipient's account balance
     hash.update(`${recipient.accountBalance}${signatureKey}`);
     const recipientIntegrity = hash.digest('hex') === recipient.accountBalanceSignature;
 
     return senderIntegrity && recipientIntegrity;
   }
    // Return true if both sender's and recipient's balances are valid
  } catch (error) {
    throw new Error(error.message);
  }
}

// Inside the TransactionSchema
TransactionSchema.methods.processDeposit = async function (signatureKey) {
  try {
    const isApproved = await checkTransactionApproval(this._id); // Check transaction approval status

    if (isApproved) {
      const user = await User.findById(this.recipientId);
      console.log(user)
      // Verify integrity using signature key
      const isIntegrityValid = user.verifyAccountBalance(signatureKey);
      if (isIntegrityValid) {
        
        const accountBalance = parseInt(user.accountBalance)
        const transactionTotal = Math.abs(this.amount)
        const totalBalance = accountBalance + transactionTotal

        user.updateAccountBalance(totalBalance, signatureKey);
        
        this.transactionStatus = 'completed';
        this.updatedAt = Date.now();
        // console.log("this iss",this)
        user.transactions.push(this);
        // await user.save()
        await this.save();
      }else{
        throw new Error('Transaction integrity compromised.');
      }  

      // Update user account balance
      // Update transaction status to completed

      return true; // Transaction processed successfully
    } else {
      throw new Error('Transaction not approved.');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


// Inside the TransactionSchema
TransactionSchema.methods.processWithdraw = async function (signatureKey) {
  try {
    const isApproved = await checkTransactionApproval(this._id); // Check transaction approval status

    if (isApproved) {
      const user = await User.findById(this.senderId);
      // console.log(user)
      // Verify integrity using signature key
      const isIntegrityValid = user.verifyAccountBalance(signatureKey);
      if (isIntegrityValid) {
        let totalDeduct = Math.abs(this.amount);
        let userBalance = parseInt(user.accountBalance)
      const newBalance = userBalance - totalDeduct;
        console.log('new balance',newBalance)
        user.updateAccountBalance(newBalance, signatureKey);
        
        this.transactionStatus = 'completed';
        this.updatedAt = Date.now();
        console.log("this iss",this)
        user.transactions.push(this);
  
        await this.save();
      }else{
        throw new Error('Transaction integrity compromised.');
      }  

      // Update user account balance
      // Update transaction status to completed

      return true; // Transaction processed successfully
    } else {
      throw new Error('Transaction not approved.');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Inside the TransactionSchema
TransactionSchema.methods.processGameEntry = async function (signatureKey) {
  try {
    const isApproved = await checkTransactionApproval(this._id); // Check transaction approval status
  if(isApproved){
console.log(this.senderId)
    const user = await User.findOne({_id:this.senderId});
    console.log(user)
    const game = await Game.findOne({gameLink:this.gameLink});
    console.log(game)
    // Verify integrity using signature key
    const isIntegrityValid = user.verifyAccountBalance(signatureKey);
    const isgameIntegrityValid = game.verifyAccountBalance(signatureKey);
    
    if (isIntegrityValid && isgameIntegrityValid) {
      
      const totalBalance = parseInt(user.accountBalance)
      const transactionTotal = Math.abs(this.amount)
      const newUserBalance = totalBalance-transactionTotal
      user.updateAccountBalance(newUserBalance, signatureKey);

      const totalGameBalance = parseInt(game.accountBalance)
      const newGameTotal = totalGameBalance+transactionTotal
      
      game.updateAccountBalance(newGameTotal, signatureKey);

      this.transactionStatus = 'completed';
      this.updatedAt = Date.now();
      // console.log("this iss",this)
      game.paidPlayers.push(user._id)
      user.transactions.push(this);
      console.log(game)
      // await user.save()
     
      await this.save();
    }else{
      throw new Error('Transaction integrity compromised.');
    }  


    // Update user account balance
    // Update transaction status to completed

    return true; // Transacti

    

    } else {
      throw new Error('Transaction not approved.');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};





TransactionSchema.methods.verifyDepositIntegrity = function (signatureKey, recipient) {
  try {
    const hash = crypto.createHash('sha256');

   
   if(recipient){
     // Verify integrity of recipient's account balance
     hash.update(`${recipient.accountBalance}${signatureKey}`);
     const recipientIntegrity = hash.digest('hex') === recipient.accountBalanceSignature;
 
     // Return true if both sender's and recipient's balances are valid
     return recipientIntegrity;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}


// Dummy function for transaction approval (to be replaced later)
async function checkTransactionApproval(transactionId) {
  // Simulate transaction approval (returning true for demonstration purposes)
  return true;
}


const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;