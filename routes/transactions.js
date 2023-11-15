
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        res.render("pages/home", {

        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Error fetching users" });
    }
});


module.exports = router;