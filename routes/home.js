
const express = require("express");
const router = express.Router();
const User = require('../models/User')
const Game = require('../models/Game');

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

  // Game.deleteMany({}).then((done)=>{
  //   console.log(done)
  // })
router.get("/publicGames", async (req, res) => {

    const user = req.user
    const games = await Game.find({isPrivate:false});


    try {
        res.render("pages/publicGames", {
            style:"publicGames",user,
            script:"publicGames",
            games
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


  
  



module.exports = router;