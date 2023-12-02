const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const gameSchema = new mongoose.Schema({
  gameType: {
    type: String,
    required: true,
  },
  players: {
    type: [Object], // Assuming player IDs are stored as strings
    required: true,
    default:[]
  },
  stakePerGame:{
    type:Number,
    default:5
  }
  ,
  maxPlayers:{
    type:Number,
    default:2
  },
  roomName: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: true,
  },
  gameAdmin:{
    type:String,
    required:false,
    default:''
  },
  gameLink:{
    type:String,
    required:true,
    default:''
  }
  ,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  timeStamp:{
    type:String,
    default:'' 
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  gameLog:{
    type:Array,
    default:[]
  },
  accountBalance:{
    type: Number,
    default: 0,
    },
    paidPlayers:{
      type:Array,
      default:[]
    },
    accountBalanceSignature: String,
});

// Static method to create a new game
gameSchema.statics.createGame = async function (gameData) {
  try {
    const newGame = await this.create(gameData);
    return newGame;
  } catch (error) {
    throw new Error(error.message);
  }
};


gameSchema.pre('save', async function (next) {
  const game = this;
  const saltRounds = 10; // Increasing rounds increases hashing time

  try {
    if (game.isModified('password')) {
      const hashedPassword = await bcrypt.hash(game.password, saltRounds);
      game.password = hashedPassword;
      
    }

    
    return next();
  } catch (err) {
    return next(err);
  }
 
});



// Instance method to update a game
gameSchema.methods.updateGame = async function (updateData) {
  try {
    Object.assign(this, updateData);
    this.updatedAt = Date.now();
    await this.save();
    return this;
  } catch (error) {
    throw new Error(error.message);
  }
};
gameSchema.methods.playerJoin = async function ({userName, imageUrl, userId,symbol}) {
  try {
 if(!this.players.includes({userName, imageUrl, userId, symbol})){
  this.players.push({userName, imageUrl, userId, symbol})
  this.updatedAt = Date.now();
  await this.save();
  return this;
}else{
  return this;
}
  } catch (error) {
    throw new Error(error.message);
  }
};
// Instance method to remove a game
gameSchema.methods.removeGame = async function () {
  try {
    await this.remove();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Method to update and sign account balance
gameSchema.methods.updateAccountBalance = async function (
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

  // Save the updated balance
  await this.save();
  
};

// Method to verify account balance integrity
gameSchema.methods.verifyAccountBalance = function (secretKey) {
  // Recreate the hash and compare with the stored signature
  const hash = crypto.createHash("sha256");
  hash.update(`${this.accountBalance}${secretKey}`);
  const recalculatedSignature = hash.digest("hex");

  return this.accountBalanceSignature === recalculatedSignature;
};

const Game =  mongoose.models.Game ||mongoose.model('Game', gameSchema);

module.exports = Game;
