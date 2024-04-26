/*
    show profile view, edit route...
*/
const express = require("express");
const router = express.Router({mergeParams: true});
const bcrypt = require('bcrypt');

const isLoggedIn = require("../middleware/isLoggedIn");
const Profile = require("../models/userProfileSchema");

// profile page
router.get("/", isLoggedIn, async(req, res)=>{
    // console.log( req.session.user.username);
    const profile = await Profile.findOne({username: req.session.user.username});
    if (profile) {
        let profilePicture = "";
        if (profile.gender==="Male") profilePicture = "https://i.pinimg.com/736x/5f/40/6a/5f406ab25e8942cbe0da6485afd26b71.jpg";
        else profilePicture = "https://as2.ftcdn.net/v2/jpg/03/79/62/53/1000_F_379625315_xvTWKW3wg7MNe3zLThwcV4rtVkhfcINQ.jpg";
        res.render("profile.ejs", {profile, profilePicture});
    }
    else {
        // alert("You are not Login!!!");
        res.render("login.ejs");
    }
});

// show profile...
router.get("/:username", isLoggedIn, async(req, res) => {
    try {
        const sender = req.session.user.username;
        const receiver = req.params.username;
        // console.log("receiver===> ", receiver, "sender===> ", sender);
        const profile = await Profile.findOne({username: receiver});
        // console.log("Profile:=== ", profile);
        if (profile) {
            let profilePicture = "";
            if (profile.gender==="Male") profilePicture = "https://i.pinimg.com/736x/5f/40/6a/5f406ab25e8942cbe0da6485afd26b71.jpg";
            else profilePicture = "https://as2.ftcdn.net/v2/jpg/03/79/62/53/1000_F_379625315_xvTWKW3wg7MNe3zLThwcV4rtVkhfcINQ.jpg";
            res.render("profile.ejs", {profile, profilePicture});
        }
        else {
            req.flash("error", "User not found");
            res.redirect("/home");
        }
    }
    catch {
        req.flash("error", "OccurSomething wrong Tri again please!");
        res.redirect("/home/search");
    }
});


router.get("/:username/edit", isLoggedIn, async (req, res) => {
    try {
        const username = req.params.username;
        // console.log(username);
        const profile = await Profile.findOne({username: username});
        console.log("profile = ", profile);
        // res.send(profile);
        res.render("edit_Profile.ejs", { profile });
    }
    catch (err) {
        console.error(err);
        res.send("Error: page not found");
    }
});

router.post("/:username/edit", isLoggedIn, async (req, res) => {
    try {
        const profile = req.body;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        profile.password = hashedPassword;
        const updProfile = await Profile.findOne({username: req.params.username});
        const upd = await Profile.findByIdAndUpdate(updProfile._id, profile);
        req.flash("success", "Profile Edited Successfully!!!");
        res.redirect("/profile");
    }
    catch(err) {
        console.log(err);
        req.flash("error", "Profile Update Failed!!!");
        res.redirect("/home");
    }
});


module.exports = router;
