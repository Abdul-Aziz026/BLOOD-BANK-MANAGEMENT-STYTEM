/*
    signup, login and logout route...
*/  
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const router = express.Router({mergeParams: true});
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

// model require
const Profile = require("../models/userProfileSchema");


// signup get route...
router.get("/signup", (req, res)=>{
    res.render("signupform.ejs");
});

// signup post route...
router.post("/signup", async(req, res)=>{
    try {
        const newUser = new Profile(req.body);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = hashedPassword;
        const user = await newUser.save();
        req.session.user = user;
        req.flash("success", "Signup Successfully!!!");
        res.redirect("/home");
    }
    catch (err) {
        // return res.send(err.message);
        req.flash("error", "faliled of signup");
        res.redirect("/home/signup");
    }
});

router.get("/login", (req, res)=>{
    res.render("login.ejs");
});

router.post('/login', async (req, res) => {
    // return res.send(req.body);
    try {
        const { username, password } = req.body;
        console.log(username, password);
        const user = await Profile.findOne({ username: username });
        console.log("user => ", user);
        if (!user) {
            req.flash("error", "username is wrong...!!!");
            return res.redirect("/auth/login");
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            req.flash("error", "password not matched...!!!");
            return res.redirect("/auth/login");
        }
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
            expiresIn: '1h',
        });
        
        res.locals.LoggedIn = true;
        req.session.user = user;
        req.flash("success", "LoggedIn Successfully...!!!");
        res.redirect("/home");
    } catch (error) {
        req.flash("error", "authentication Failed...!!!");
        res.redirect("/auth/login");
    }
});


router.get("/logout", (req, res, next)=>{
    req.session.user = false;
    res.locals.LoggedIn = false,
    req.flash("success", "You are Logged Out!!!");
    res.redirect("/home");
});

module.exports = router;
