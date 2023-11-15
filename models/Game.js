const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameType: {
    type: String,
    required: true,
  },
  players: {
    type: [String], // Assuming player IDs are stored as strings
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: true,
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

// Static method to create a new game
gameSchema.statics.createGame = async function (gameData) {
  try {
    const newGame = await this.create(gameData);
    return newGame;
  } catch (error) {
    throw new Error(error.message);
  }
};

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
