const express = require("express");
const app = express();
const mongoose = require("mongoose");
// boilerplate includer
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');
dotenv.config();
const session = require("express-session");
const flash = require("connect-flash");
const isLoggedIn = require("./middlewares.js");
// email sender npm
const nodemailer = require("nodemailer");

// passport ....
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Profile = require("./models/userProfileSchema.js");

// passport endl

const Post = require("./models/postSchema.js");
const Message = require("./models/messageSchema.js");

// json data read...
app.use(express.json());


const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
// for serving public folder css file all place
app.use(express.static(path.join(__dirname, "/public")));

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended: true}));

// mongo connection check
require("./dataBaseConnectionCheck.js");

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

app.use(session(sessionOptions));
// flash....
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Profile.authenticate()));

passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

// passport end

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    // console.log("come here", res.locals.success, res.locals.error);
    if (req.session.user) {
        res.locals.LoggedIn = req.session.user;
        res.locals.roles = 1;
    }
    else {
        res.locals.LoggedIn = undefined;
        res.locals.roles = 0;
    }
    next();
});

app.get("/home", (req, res)=>{
    res.render("home.ejs");
});
const createUser = require("./routes/authenticationRouter.js");
app.use("/auth", createUser);

const profileRoute = require("./routes/profileRouter.js");
app.use("/profile", profileRoute);

const messageRouter = require("./routes/messageRouter.js");
app.use("/message", messageRouter);

//send mail...
const mailsendRouter = require("./routes/mailsendRouter.js");
app.use("/sendMail", mailsendRouter);


// post Router
const postRouter = require("./routes/postRouter.js");
app.use("/posts", postRouter);

app.get("/home/posts/edit/:username", isLoggedIn, async(req, res)=>{
    try {
        const username = req.params.username;
        if (req.user.username === username) {
            const editPost = await Post.findOne({username: username});
            // res.send("hello");
            // console.log("form data: ", editPost);
            // res.send(editPost);
            res.render("editPost.ejs", {editPost});
        }
        else {
            req.flash("error", "You are not the author of this Post...");
            res.redirect("/home/posts");
        }
    }
    catch(err) {
        console.log(req.user);
        res.send('error');
    }
});
app.post("/home/posts/edit/:username", isLoggedIn, async(req, res)=>{
    // res.send("Post updated");
    const username = req.params.username;
    try {
        if (req.user.username === username) {
            const Profile = req.body;
            Profile.username = username;
            // res.send(Profile);
            const editPost = await Post.findOne({username: username});
            await Post.findByIdAndUpdate(editPost._id, Profile);
            // res.send("hello");
            // console.log("form data: ", editPost);
            // res.send(editPost);
            res.redirect("/home/posts");
        }
        else {
            req.flash("error", "You are not the author of this Post...");
            res.redirect("/home/posts");
        }
    }
    catch(err) {
        req.flash("error", "Some thing Wrong happened...");
        res.redirect("/home/posts");
    }
});

app.get("/home/posts/:id", (req, res)=>{
    res.render("show_individual_Posts.ejs");
});

app.get("/home/search", async(req, res)=>{
    const searchUsers = await Profile.find({id: ""});
    res.render("search.ejs", {searchUsers});
});


app.post("/home/search", async (req, res) => {
    const {division, district, bloodgroup} = req.body;
    // console.log("data ", division, district, bloodgroup);
    const searchUsers = await Profile.find({$and: [{
            bloodgroup: bloodgroup },
            {
                $or: [
                { district: district },
                { division: division }
                ]
            }
        ]});
    // console.log(searchUsers);
    res.render("search.ejs", {searchUsers});
});

app.use("*", (req, res)=>{
    res.send("404: Page not Found");
});


app.listen(8000, ()=>{
    console.log(`Listening on port 8080, Alhamdulillah...!!!`);
});
