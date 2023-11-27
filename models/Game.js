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
  }
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

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
