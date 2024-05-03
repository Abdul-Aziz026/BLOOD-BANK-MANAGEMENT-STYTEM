const express = require("express");
const app = express();
// boilerplate includer
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');
dotenv.config();
const session = require("express-session");
const flash = require("connect-flash");
// email sender npm

const Profile = require("./models/userProfileSchema.js");

// this is for csv file upload in database...
const csv=require('csvtojson')
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
// csv part end...

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

// session middle wares...
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
    // console.log("cur user info ", res.locals.LoggedIn);
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

const userRouter = require("./routes/userRouter");
app.use("/users", userRouter);

const systemAdminRouter = require("./routes/systemAdminRouter.js");
app.use("/myhome", systemAdminRouter);

const searchRouter = require("./routes/searchRouter");
app.use("/home", searchRouter);

app.use("*", (req, res)=>{
    req.flash("error", "404: Page not Found");
    res.redirect("/home");
});


app.listen(8000, ()=>{
    console.log(`Listening on port 8000, Alhamdulillah...!!!`);
});
