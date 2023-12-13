
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

router.get("/puzzleParty", async (req, res) => {

    const user = req.user;
    try {
        res.render("openGames/puzzleParty", {
            style:"puzzleParty",
            user,
            script:'puzzleParty',
            layout: "layouts/openGame",
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


router.get("/diceDuel", async (req, res) => {

    const user = req.user;
    try {
        res.render("openGames/diceDuel", {
            style:"diceDuel",
            user,
            script:'diceDuel',
            layout: "layouts/openGame",
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


router.get("/magicalMaze", async (req, res) => {

    const user = req.user;
    try {
        res.render("openGames/magicalMaze", {
            style:"magicalMaze",
            user,
            script:'magicalMaze',
            layout: "layouts/openGame",
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


  
  

router.get("/slots", async (req, res) => {

    const user = req.user;
    try {
        res.render("openGames/slots", {
            style:"slots",
            user,
            script:'slots',
            layout: "layouts/openGame",
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
});


module.exports = router;