const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const User = require("../models/User");
const Game = require("../models/Game");

const Transaction = require("../models/Transaction");
require("dotenv").config();

// Deposit endpoint
router.post("/deposit", async (req, res) => {
  try {
    const { userId, phoneNumber, amount } = req.body;

    // Validate user credentials
    const user = await User.findById(userId);

    const recipientId = userId;
    const senderId = phoneNumber;
    const transactionToken = generateUniqueToken();
    const signature = generateTransactionSignature();

    // Create and initiate a new transaction
    const newTransaction = new Transaction({
      transactionType: "DEPOSIT",
      amount,
      transactionToken,
      senderId,
      recipientId,
      signature,
    });
    await newTransaction.save(); // Save the transaction for verification

    await user.save();
    approveTransactions();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// game transfer endpoint
router.post("/gametransfer", async (req, res) => {
  try {
    const { pin, gameLink, userId } = req.body;
    const game = await Game.findOne({gameLink:gameLink})
    console.log(game)
    // Validate user credentials
    const user = await User.findOne({_id:userId});
    const safeNumber = generateUniqueToken();
    console.log(safeNumber)
    if ((await user.comparePin(pin))) {
  
      console.log('game link', gameLink)
      const recipientId = gameLink;
      const senderId = userId;
    const transactionToken = generateUniqueToken();
    const signature = generateTransactionSignature();

    // Create and initiate a new transaction
    const newTransaction = new Transaction({
      transactionType: "GAME-ENTRY",
      amount:game.stakePerGame,
      transactionToken,
      senderId,
      recipientId,
      signature,
      gameLink
    });
    await newTransaction.save(); // Save the transaction for verification
    
      
    await user.save();
    approveTransactions();
    res.redirect("/game/joinGame/"+gameLink);
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getTransaction/:transactionId", async (req, res) => {

  try {
    const transactionId = req.params.transactionId
 const transaction = await Transaction.findOne({_id:transactionId})
res.render("transactions/viewTransaction",{
  transaction,
  style:'transaction',
  script:'home'
})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Withdrawal endpoint
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, phoneNumber, amount, pin } = req.body;

    // Validate user credentials
    const user = await User.findById(userId);
    if (!user || !(await user.comparePin(pin))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const recipientId = phoneNumber;
    const senderId = userId;
    const transactionToken = generateUniqueToken();
    const signature = generateTransactionSignature();

    // Create and initiate a new transaction
    const newTransaction = new Transaction({
      transactionType: "WITHDRAWAL",
      amount,
      transactionToken,
      senderId,
      recipientId,
      signature,
    });
    await newTransaction.save(); // Save the transaction for verification

    //   user.pushTransaction(newTransaction)
    await user.save();
    approveTransactions();
    // res.json({ message: "Withdrawal initiated, pending approval" });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function generateUniqueToken() {
  return crypto.randomBytes(10).toString("hex");
    
}

function generateTransactionSignature() {
  return crypto.randomBytes(10).toString("hex");
  
}
async function approveTransactions() {
  try {
    const secretKey = process.env.MoneyKey;
    console.log("Secret Key:", secretKey);

    const pendingTransactions = await Transaction.find({
      transactionStatus: "initiated",
    });
    // console.log(pendingTransactions);
    for (const transaction of pendingTransactions) {
      // Process transactions needing approval (e.g., deposits)
      if (transaction.transactionType === "DEPOSIT") {
        await transaction.processDeposit(secretKey); // Process deposit transactions
        console.log(`Approved deposit transaction with ID: ${transaction._id}`);
      }

      if (transaction.transactionType === "WITHDRAWAL") {
        await transaction.processWithdraw(secretKey); // Process deposit transactions
        console.log(`Approved withdraw transaction with ID: ${transaction._id}`);
      }

      if (transaction.transactionType === "GAME-ENTRY") {
        await transaction.processGameEntry(secretKey); // Process deposit transactions
        console.log(`Approved game Entry transaction with ID: ${transaction._id}`);
      }


      // Process other transaction types requiring approval (e.g., game entries)
      // Add similar logic for other transaction types if needed

      // You can add more conditions to handle different transaction types

      // Alternatively, process other transaction types as needed
    }

    console.log("All pending transactions approved!");
  } catch (error) {
    console.error("Error approving transactions:", error.message);
  }
}

setInterval(approveTransactions, 5000);
module.exports = router;
