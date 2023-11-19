
const express = require("express");
const router = express.Router();
const User = require('../models/User')
const Game = require('../models/game');

router.get("/", async (req, res) => {

    const user = req.user;
    try {
        res.render("pages/home", {
            style:"home",
            user,
            script:'home'
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


router.post('/updateUser', async (req, res) => {
    try {
      // Fetch the user from the database using the user ID
      const user = await User.findById(req.body.userId);
  
      // Update user attributes based on the form data
      user.userName = req.body.userName;
      user.phoneNumber = req.body.phoneNumber;
      user.email = req.body.email;
  
      // If a new image URL is provided, update it
      if (req.body.imageUrl !== user.imageUrl) {
        user.imageUrl = req.body.imageUrl;
      }
  
      // Save the updated user
      await user.save();
  
      res.redirect('/'); // Redirect to the home page or any other desired page after updating
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

router.get("/publicGames", async (req, res) => {

    const user = await User.findById(req.user._id);
  


  
    try {
        res.render("pages/publicGames", {
            style:"publicGames",user,
            script:"publicGames"
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


router.post('/manageFriend', async (req, res) => {
    try {
      const userId = req.user._id; // Assuming userId is available in req.user after authentication
      const friendId = req.body.friendId;
  console.log(userId+"/n"+ friendId)
      // Check if they are already friends
      const areFriends = checkIfFriends(userId, friendId);
  
      if (areFriends) {
        console.log('re,ooe')
        // If they are friends, remove the friend
        await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
      } else {
        console.log('adddd')
        // If they are not friends, send a friend request
        await User.findByIdAndUpdate(userId, { $push: { friends: friendId } });
        // You might want to implement a notification system for the friend request
      }
  
      res.redirect('/'); // Redirect to the home page or any other desired page after managing the friend
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.post('/createGame', async (req, res) => {
    try {
      const {
        gameType,
        maxPlayers,
        roomName,
        password,
        gameAdmin
      } = req.body; // Assuming your request body contains the necessary data
     
      const gameData = {
        gameType,
        players: req.body.players,      
        isPrivate: req.body.isPrivate === 'on', // Assuming it's a checkbox returning 'on' when checked
        gameType,
        players:[req.body.gameAdmin],
        maxPlayers,
        roomName,
        password,
        gameAdmin
      }
      
      const newGame = await Game.createGame(gameData);
      res.status(201).json(newGame);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  



  async function checkIfFriends(userId, friendId) {
    try {
      const user = await User.findById(userId);
  
      // Check if the friendId is in the user's friends array
      const areFriends = user.friends.includes(friendId);
  console.log(user )
      if(areFriends){
        console.log('true')
          return true;
    }
    else{
        console.log('false')
          return false;
      }

    } catch (error) {
      console.error(error);
      // Handle the error, for now, return false
      return false;
    }
  }


  



module.exports = router;