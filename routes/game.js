
const express = require("express");
const router = express.Router();
const User = require('../models/User')
const Game = require('../models/game');


router.post('/createGame', async (req, res) => {
    try {
      // Extract game data from the request body
      const { gameType, maxPlayers, roomName, password, gameAdmin } = req.body;
      const user = req.user
  
      // Generate a unique game link based on room name and additional characters
      const gameLink = generateUniqueGameLink(roomName);
  
      // Create a new game with game data and generated game link
      const gameData = {
        gameType,
        players: [gameAdmin], // Assuming the game creator is the first player
        maxPlayers,
        roomName,
        password,
        gameAdmin,
        gameLink,
      };
      // Save the game details to the database
      const newGame = await Game.createGame(gameData);
      newGame.save();
      let gamePage = 'errorPage'; // Default game page for unknown game types or errors
      if (newGame) {
        gamePage = `gamePages/`+newGame.gameType; // Cards game page
      } 
      // 
      // Determine the redirect URL based on the game type
      res.render(gamePage, { newGame,
        style:newGame.gameType,
        user,
        script:newGame.gameType,
        layout: 'layouts/gameLayout',
      game:newGame});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/joinGame', async (req, res) => {
    try {
      const { gameLink } = req.body;
      const user = req.user
  
      // Query the game details using the provided game link
      const game = await Game.findOne({ gameLink });
  
      if (!game) {
        // Handle case when the game link doesn't exist
        res.redirect('/errorPage'); // Redirect to an error page or handle the situation accordingly
        return;
      }
  
      // Determine the redirect URL based on the game type from the retrieved game details
      let gamePage = 'errorPage'; // Default game page for unknown game types or errors
      if (game) {
        gamePage = `gamePages/`+game.gameType; // Cards game page
      } 
      // Add other game types as needed
  
      // Render the game page with the retrieved game object
      res.render(gamePage, { game,
        style:game.gameType,
        user,
        script:game.gameType});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  
 // Function to generate a unique game link
function generateUniqueGameLink(roomName) {
    // Replace spaces in roomName with dashes and convert to lowercase for URL friendliness
    const formattedRoomName = roomName.replace(/\s+/g, '-').toLowerCase();
  
    // Generate a timestamp to make the link more unique
    const timestamp = Date.now();
  
    // Combine roomName with timestamp to create the game link
    const gameLink = `${formattedRoomName}-${timestamp}`;
  
    return gameLink;
  }
    



module.exports = router;