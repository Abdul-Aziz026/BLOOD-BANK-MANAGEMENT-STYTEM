const express = require("express");
const router = express({mergeParams: true});

const Profile = require("../models/userProfileSchema");

router.get("/", async(req, res)=> {
    const users = await Profile.find();
    res.render("userList.ejs", {users});
});

router.get("/:username", async(req, res)=>{
    const userName = req.params.username;
    const profile = await Profile.findOne({username: userName});
    res.render("roleUpdateProfile.ejs", {profile});
});

router.post("/updaterole/:username", async(req, res)=>{
    res.send(req.body);
});



module.exports = router;