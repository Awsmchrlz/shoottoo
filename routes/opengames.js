
const express = require("express");
const router = express.Router();
const User = require('../models/User')

router.get("/openRuffle", async (req, res) => {

    const user = req.user;
    try {
        res.render("openGames/openRuffle", {
            style:"openRuffle",
            user,
            script:'openRuffle',
            layout: "layouts/openGame",
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


  
  



module.exports = router;