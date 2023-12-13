const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/User");
const Game = require("../models/Game");

module.exports = function (io) {
  router.post("/createGame", async (req, res) => {
    try {
      // Extract game data from the request body
      const { gameType, maxPlayers, roomName, gameAdmin, isPrivate } = req.body;
      const user = req.user;
      console.log(isPrivate);
      // Generate a unique game link based on room name and additional characters
      const gameLink = generateUniqueGameLink(roomName);

      // Create a new game with game data and generated game link
      const gameData = {
        gameType,
        players: [], // Assuming the game creator is the first player
        maxPlayers,
        roomName,
        gameAdmin,
        gameLink,
        isPrivate: req.body.isPrivate === "on", // Assuming it's a checkbox returning 'on' when checked
      };

      // Save the game details to the database
      const newGame = await Game.createGame(gameData);
      newGame.updateAccountBalance(0, process.env.MoneyKey)

      // newGame.save();
      let gamePage = "errorPage"; // Default game page for unknown game types or errors
      if (newGame) {
        gamePage = `gamePages/` + newGame.gameType; // Cards game page
      }

      // Determine the redirect URL based on the game type
      res.render(gamePage, {
        newGame,
        style: newGame.gameType,
        user,
        script: newGame.gameType,
        layout: "layouts/gameLayout",
        game: newGame,
      });
      addGame(newGame);
      if (!newGame.isPrivate) {
        io.emit("newPublicGame", newGame);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  router.get("/joinGame/:gameLink", async (req, res) => {
    try {

      const { gameLink } = req.params;
      const user = req.user;
      // Query the game details using the provided game link
      const game = await Game.findOne({ gameLink });

      if (!game) {
        // Handle case when the game link doesn't exist
        res.redirect("/game/gamenotfound");
        return;
      }

      const isPlayerInGame = true;
      // Check if the game is not full
      if (game.players.length <= game.maxPlayers || isPlayerInGame) {
        // Add the player to the game
        // Save the updated game with the new player
        await game.save();

        // Determine the redirect URL based on the game type from the retrieved game details
        let gamePage = "errorPage"; // Default game page for unknown game types or errors
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
          layout: "layouts/gameLayout",
        });
      } else {
        // Game is full, handle accordingly
        res.redirect("/game/gamefull");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/joinGame", async (req, res) => {
    try {

      const { gameLink } = req.body;
      const user = req.user;
      // Query the game details using the provided game link
      const game = await Game.findOne({ gameLink });

      if (!game) {
        // Handle case when the game link doesn't exist
        res.redirect("/game/gamenotfound");
        return;
      }

      const isPlayerInGame = true;
      // Check if the game is not full
      if (game.players.length <= game.maxPlayers || isPlayerInGame) {
        // Add the player to the game
        // Save the updated game with the new player
        await game.save();

        // Determine the redirect URL based on the game type from the retrieved game details
        let gamePage = "errorPage"; // Default game page for unknown game types or errors
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
          layout: "layouts/gameLayout",
        });
      } else {
        // Game is full, handle accordingly
        res.redirect("/game/gamefull");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Function to generate a unique game link

  function generateUniqueGameLink(roomName) {
    const formattedRoomName = roomName.replace(/\s+/g, "-").toLowerCase();
    const characters = "ilnou17"; // Characters for uniqueness
    const timestamp = Date.now();

    // Generate characters to surround the roomName and timestamp
    let prefix = "";
    let suffix = "";
    for (let i = 0; i < 8; i++) {
      prefix += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      suffix += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    // Combine all elements to create the game link
    const gameLink = `${prefix}-${formattedRoomName}-${suffix}`;

    return gameLink;
  }

  io.on("connection", async (socket) => {
    //game message
    socket.on("GameMessage", (data) => {
      console.log("fadada", data.gameLink);
      socket.join(data.gameLink);
      io.to(data.gameLink).emit("GameMessage", data);
    });
    socket.on("JoinSocket", (data) => {
      socket.join(data.gameLink);
    });

    // Emit initial messages to the newly connected client
    socket.emit("initialGames", getLatestGames());

    socket.on("XandOMove", ({ index, userId, symbol, gameLink }) => {
      socket.join(gameLink);
      io.to(gameLink).emit("updateBoard", { index, userId, symbol });
    });

    socket.on(
      "ChessMove",
      ({ pieceId, location, capture, gameLink, senderId }) => {
        if (senderId !== socket.id) {
          socket.join(gameLink);
          socket
            .to(gameLink)
            .emit("updateChessBoard", {
              pieceId,
              location,
              capture,
              senderId: socket.id,
            });
        }
      }
    );

    socket.on(
      "CheckersMove",
      (targetSquare) => {
  console.log('checkers', targetSquare)
          // socket.join(gameLink);
          // socket
          //   .to(gameLink)
          io
            .emit("UpdateCheckersBoard", targetSquare);
        
      }
    );


    socket.on(
      "JoinXandOGame",
      ({ userName, userId, gameLink, gameId, imageUrl }) => {
        // if (game.players.length < 2) {
        Game.findOne({ _id: gameId, gameType: "xando" }).then((game) => {
          if (game) {
            socket.join(gameLink);

            let flag = false;
            game.players.forEach((player) => {
              if (userId == player.userId) {
                flag = true;
              }
            });
            if (!flag) {
              game.playerJoin({
                userName,
                imageUrl,
                userId,
                symbol: game.players.length == 0 ? "X" : "O",
              });
            }
            console.log("game found", game);
            io.to(gameLink).emit("gameDetails", { players: game.players });
          }
        });
        // }
      }
    );

    socket.on(
      "JoinChessGame",
      ({ userName, userId, gameLink, gameId, imageUrl }) => {
        Game.findOne({ _id: gameId, gameType: "chess"}).then((game) => {
     
          if (game) {
            console.log("game likk", gameLink);
            socket.join(gameLink);

            let flag = false;
            game.players.forEach((player) => {
              if (userId == player.userId) {
                flag = true;
              }
            });
            
            if (!flag && game.players.length <= 2) {
              game.playerJoin({
                userName,
                imageUrl,
                userId,
                symbol: game.players.length == 0 ? "WHITE" : "BLACK",
              });
            
            }
            console.log("game found", game);
            io.to(gameLink).emit("gameDetails", { players: game.players,paidPlayers:game.paidPlayers,stake:game.stakePerGame });
        
          }
        
        });
      }
    );
    
    socket.on(
    "joinCheckersGame",
    ({ userName, userId, gameLink, gameId, imageUrl }) => {
      // if (game.players.length < 2) {
      Game.findOne({ _id: gameId, gameType: "draughts" }).then((game) => {
        if (game) {
          console.log("game likk", gameLink);
          socket.join(gameLink);

          let flag = false;
          game.players.forEach((player) => {
            if (userId == player.userId) {
              flag = true;
            }
          });
          if (!flag) {
            game.playerJoin({
              userName,
              imageUrl,
              userId,
              symbol: game.players.length == 0 ? "WHITE" : "BLACK",
            });
          }
          console.log("game found", game);
          io.to(gameLink).emit("gameDetails", { players: game.players });
        }
      });
      // }
    }
    );
  });

  
  const MAX_GAMES = 5;
  let Games = [];

  function addGame(game) {
    Games.push(game);
    if (Games.length > MAX_GAMES) {
      Games.shift(); // Remove the oldest message if the limit is exceeded
    }
  }

  function getLatestGames() {
    return Games;
  }

  return router;
};
