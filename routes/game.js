
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
      const user = req.user;
  
      // Query the game details using the provided game link
      const game = await Game.findOne({ gameLink });
  
      if (!game) {
        // Handle case when the game link doesn't exist
        res.redirect('/game/gamenotfound');
        return;
      }
  
      // Check if the game is not full
      if (game.players.length < game.maxPlayers) {
        // Add the player to the game
        const isPlayerInGame = game.players.includes(user._id);

      if (!isPlayerInGame) {
        // Add the player to the game
        game.players.push(user._id); // Assuming player IDs are stored in the 'players' array

        // Save the updated game with the new player
        await game.save();
      }

        // Save the updated game with the new player
        await game.save();
  
        // Determine the redirect URL based on the game type from the retrieved game details
        let gamePage = 'errorPage'; // Default game page for unknown game types or errors
        if (game) {
          gamePage = `gamePages/${game.gameType}`; // Redirect to the specific game page
        }
        // Add other game types as needed
  
        // Render the game page with the retrieved game object
        res.render(gamePage, {
          game,
          style: game.gameType,
          user,
          script: game.gameType,
          layout: 'layouts/gameLayout',
        });
      } else {
        // Game is full, handle accordingly
        res.redirect('/game/gamefull');
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

 // Function to generate a unique game link

    
 function generateUniqueGameLink(roomName) {
  const formattedRoomName = roomName.replace(/\s+/g, '-').toLowerCase();
  const characters = 'ilnou17'; // Characters for uniqueness
  const timestamp = Date.now();

  // Generate characters to surround the roomName and timestamp
  let prefix = '';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    prefix += characters.charAt(Math.floor(Math.random() * characters.length));
    suffix += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Combine all elements to create the game link
  const gameLink = `${prefix}-${formattedRoomName}-${suffix}`;

  return gameLink;
}



module.exports = router;