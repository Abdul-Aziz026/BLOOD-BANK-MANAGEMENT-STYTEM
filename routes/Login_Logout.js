const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const router = express.Router({mergeParams: true});
const mongoose = require("mongoose");


// passport ....
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Profile = require("../models/userProfileSchema.js");
const MONGO_URL = process.env.MONGO_URL;

main()
.then(() => console.log("connection Successfull in database."))
.catch((err) => {
    console.log(err)
});
async function main() {
  await mongoose.connect(MONGO_URL);
}

// passport middle wares...
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

router.use(session(sessionOptions));
// flash....
router.use(flash());

router.use(passport.initialize());
router.use(passport.session());

passport.use(new LocalStrategy(Profile.authenticate()));

passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());




router.get("/logout", (req, res, next)=>{
    req.logout((err)=>{
        if (err) {
            next(err);
        }
        res.locals.LoggedIn = false,
        req.flash("success", "You are Logged Out!!!");
        res.redirect("/home");
    })
});

router.get("/login", (req, res)=>{
    res.render("login.ejs");
});

router.post("/login", 
    passport.authenticate('local', {
        failureRedirect: '/home/login',
        failureFlash: true 
    }),
    (req, res) =>{
        res.locals.LoggedIn = req.user;
        // console.log(connect.sid.value);
        req.flash("success", "You are logged in!!!");
        res.redirect("/home");
    }
);


// signup get route...
router.get("/home/signUp", (req, res)=>{
    res.render("signupform.ejs");
});

// signup post route...
router.post("/home/signup", async(req, res)=>{
    try{
        const userSchema = new Profile(req.body);

        // console.log(userSchema);
        const registeredUser = await Profile.register(userSchema, req.body.password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            res.locals.LoggedIn = req.user;
            req.flash("success", "Signup Successfully!!!");
            res.redirect("/home");
        });
    }
    catch(err) {
        req.flash("error", "faliled of signup");
        res.redirect("/home/signup");
    }
});



module.exports = router;
