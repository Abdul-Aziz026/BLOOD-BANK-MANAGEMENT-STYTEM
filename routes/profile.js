const express = require("express");
const router = express.Router({mergeParams: true});


router.get("/", (req, res) => {
    res.send("Abdul Aziz, Masaallah You done a new Job...")
});

module.exports = router;
