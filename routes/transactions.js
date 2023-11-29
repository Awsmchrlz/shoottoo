const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Transaction = require("../models/transaction");
require("dotenv").config();

// Deposit endpoint
router.post("/deposit", async (req, res) => {
    try {
      const { userId, phoneNumber,amount } = req.body;
  
      // Validate user credentials
      const user = await User.findById(userId);
      
  

      const transactionToken = generateUniqueToken();
      const recipientId = userId;
      const senderId = phoneNumber;
const signature = generateTransactionSignature();

      // Create and initiate a new transaction
      const newTransaction = new Transaction({transactionType:"DEPOSIT",
       amount ,
       transactionToken, 
       senderId,
       recipientId,
       signature
    });
      await newTransaction.save(); // Save the transaction for verification
    
    //   user.pushTransaction(newTransaction)
      await user.save();
    approveTransactions()
      res.redirect("/")
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Withdrawal endpoint
  router.post("/withdraw", async (req, res) => {
    try {
      const { userId, amount, password } = req.body;
  
      // Validate user credentials
      const user = await User.findById(userId);
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const transactionToken = generateUniqueToken();

      // Create and initiate a new transaction
      const newTransaction = new Transaction({ user: userId, type: "withdraw", amount ,transactionToken, transactionStatus: "PENDING"});
      await newTransaction.save(); // Save the transaction for verification
    
      user.transactions.push(newTransaction);
      await user.save();

      res.json({ message: "Withdrawal initiated, pending approval" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  function generateUniqueToken(){
return 'sdfg'
  }

  function generateTransactionSignature(){
    return 'rty'
  }
 async function approveTransactions(){
    try {
        const secretKey = process.env.MoneyKey;
        console.log('Secret Key:', secretKey);
    
    const pendingTransactions = await Transaction.find({ transactionStatus: 'initiated' });
console.log(pendingTransactions)
    for (const transaction of pendingTransactions) {
      // Process transactions needing approval (e.g., deposits)
      if (transaction.transactionType === 'DEPOSIT') {
        await transaction.processDeposit(secretKey); // Process deposit transactions
        console.log(`Approved deposit transaction with ID: ${transaction._id}`);
      }

      // Process other transaction types requiring approval (e.g., game entries)
      // Add similar logic for other transaction types if needed

      // You can add more conditions to handle different transaction types

      // Alternatively, process other transaction types as needed
    }

    console.log('All pending transactions approved!');
  } catch (error) {
    console.error('Error approving transactions:', error.message);
  }

  }

  setInterval(approveTransactions,5000)
module.exports = router;
