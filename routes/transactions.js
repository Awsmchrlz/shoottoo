const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Transaction = require("../models/transaction");

// Deposit endpoint
router.post("/deposit", async (req, res) => {
    try {
      const { userId, amount, pin } = req.body;
  
      // Validate user credentials
      const user = await User.findById(userId);
      if (!user || !(await user.comparePassword(pin))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const transactionToken = generateUniqueToken();

      // Create and initiate a new transaction
      const newTransaction = new Transaction({ user: userId, type: "deposit", amount ,transactionToken, transactionStatus: "PENDING"});
      await newTransaction.save(); // Save the transaction for verification
    
      user.transactions.push(newTransaction);
      await user.save();

      res.json({ message: "Deposit initiated, pending approval" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Withdrawal endpoint
  router.post("/withdraw", async (req, res) => {
    try {
      const { userId, amount, pin } = req.body;
  
      // Validate user credentials
      const user = await User.findById(userId);
      if (!user || !(await user.comparePassword(pin))) {
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

  }
  
module.exports = router;
