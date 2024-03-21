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
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
// for serving public folder css file all place
app.use(express.static(path.join(__dirname, "/public")));

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);

app.use(express.urlencoded({extended: true}));

// mongo connection check
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
    res.locals.LoggedIn = req.user;
    if (res.locals.userType==undefined) res.locals.userType = 'Admin_Login'; 
    // console.log(req.user);
    next();
});

app.get("/logout", (req, res, next)=>{
    req.logout((err)=>{
        if (err) {
            next(err);
        }
        res.locals.LoggedIn = false,
        req.flash("success", "You are Logged Out!!!");
        res.redirect("/home");
    })
});



app.get("/home/login", (req, res)=>{
    res.render("login.ejs");
});

app.post("/home/login", 
    passport.authenticate('local', {
        failureRedirect: '/home/login',
        failureFlash: true 
    }),
    (req, res) =>{
        // console.log(req.user);
        // req.user.userType = req.body.userType;
        // return res.send(req.user.userType);
        res.locals.LoggedIn = req.user;
        res.locals.userType = req.body.userType;
        // console.log(req.user);
        // console.log(connect.sid.value);
        req.flash("success", "You are logged in!!!");
        res.redirect("/home");
    }
);

app.get("/home/:username/edit", isLoggedIn, async (req, res) => {
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

app.post("/home/:username/edit", isLoggedIn, async (req, res) => {
    try {
        const profile = req.body;
        // res.send(profile);
        // {username: username}
        const updProfile = await Profile.findOne({username: req.params.username});
        const upd = await Profile.findByIdAndUpdate(updProfile._id, profile);
        console.log("profile = ", upd);
        // // res.send(profile);
        req.flash("success", "Profile Edited Successfully!!!");
        res.redirect("/home/profile");
    }
    catch(err) {
        console.log(err);
        req.flash("error", "Profile Update Failed!!!");
        res.redirect("/home");
    }
});

// show profile...
app.get("/home/profile/:username", isLoggedIn, async(req, res) => {
    try {
        const sender = req.user.username;
        const receiver = req.params.username;
        // console.log("receiver===> ", receiver, "sender===> ", sender);
        const profile = await Profile.findOne({username: receiver});
        // console.log("Profile:=== ", profile);
        // res.send("ok");
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

app.get("/home/showmsg/:username", isLoggedIn, async(req, res)=>{
    const username = req.params.username;
    const betweenMessages = await Message.find({
        $or: [
            { sender: username },
            { receiver: username }
        ]
    });
    res.render("showMsg.ejs", {betweenMessages});
});

// send message and show message...
app.get("/home/profile/:username/message", isLoggedIn, async(req, res) => {
    const sender = req.user.username;
    const receiver = req.params.username;
    console.log("sender & receiver", sender, receiver);
    // return res.send( receiver);
    const betweenMessages = await Message.find({
        $or: [
            { $and: [{ sender: sender }, { receiver: receiver }] },
            { $and: [{ sender: receiver }, { receiver: sender }] }
        ]
    });
    res.render("sendMessage.ejs", {sender, receiver, betweenMessages});
});

// send message and show message...
app.post("/home/profile/:username/message", isLoggedIn, async (req, res) => {
    try {
        const sender = req.user.username;
        const receiver = req.params.username;
        const {message} = req.body;

        const newMessage = new Message({
            sender: sender,
            receiver: receiver,
            message: message
        });
        
        // console.log(sender, receiver, req.body);
        // need to find first Profile from mongo database...
        const profileSender = await Profile.findOne({username: sender});
        const profileReceiver = await Profile.findOne({username: receiver});
        // console.log("profile => ", profile);
        profileSender.messages.push(newMessage);
        profileReceiver.messages.push(newMessage);
        // save in Message collection table...
        const saveMessage = await newMessage.save();
        // console.log(saveMessage);
        // save in Profile Collection table...
        await profileSender.save();
        await profileReceiver.save();

        // now need to search both user all messages for message table/collection
        // start work form here....
        const betweenMessages = await Message.find({
            $or: [
              { $and: [{ sender: sender }, { receiver: receiver }] },
              { $and: [{ sender: receiver }, { receiver: sender }] }
            ]
        });
        // console.log(betweenMessages[0].createdAt);
        res.render("sendMessage.ejs", {sender, receiver, betweenMessages});
    }
    catch (err){
        console.log("some error occur: ", err);
        req.flash("error", "something wrong happen");
        res.redirect(`/home/profile/${req.params.username}/message`);
    };
});


/* Mail send Route */
app.get("/home/profile/:username/mail", isLoggedIn, async(req, res) => {
    const sender = req.user.username;
    const receiver = req.params.username;
    // console.log("sender & receiver", sender, receiver);
    res.render("sendMail.ejs", {sender, receiver});
});

app.post("/home/profile/:username/mail", isLoggedIn, async (req, res) => {
<<<<<<< HEAD
=======
    const sender = req.user.username;
>>>>>>> d436f31f00d09bf23929b487296e28a5c72ff8fb
    const receiver = req.params.username;
    const senderMail = req.user.email;
    const {email} = await Profile.findOne({username: receiver});
    const subject = req.body.mailSubject;
    const mailMessage = req.body.mailMessage;
<<<<<<< HEAD
    
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'conor.kerluke@ethereal.email',
            pass: 'tqvQTaYZJgcSGxbfDC'
        }
    });
    const mailOptions = {
        // from: senderMail,//senderemail
        from: 'azizulcsebsmrstu@gmail.com',//senderemail
        // to: email,//receiver email
        to: 'azizurcsebsmrstu@gmail.com',//receiver email
        subject: subject,
        text: mailMessage
    };


    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: ", info);
        req.flash("success", "Successfully Sent Email!!!");
    } catch (error) {
        // console.log("Error sending email: ", error);
        req.flash("error", "Email Not sent...!!!");
    }
    res.redirect(`/home/profile/${receiver}`);
    // https://nodemailer.com/
    // mailbox link: https://ethereal.email/create
    // https://ethereal.email/messages
=======
    req.flash("success", "Successfully Send Mail...!!!");
    res.redirect(`/home/profile/${receiver}`);
    // return res.send({senderMail, receiverMail, subject, mailSubject});
>>>>>>> d436f31f00d09bf23929b487296e28a5c72ff8fb
});

// signup get route...
app.get("/home/signUp", (req, res)=>{
    res.render("signupform.ejs");
});

// signup post route...
app.post("/home/signup", async(req, res)=>{
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

app.get("/home", (req, res)=>{
    res.render("home.ejs");
});



// profile page
app.get("/home/profile", isLoggedIn, async(req, res)=>{
    const profile = await Profile.findOne({username: req.user.username});
    // console.log("Profile:=== ", profile);
    // res.send("ok");
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

// create post
app.get("/home/posts/new", isLoggedIn, (req, res)=>{
    res.render("create_post.ejs");
});

app.post("/home/posts/new", isLoggedIn, async(req, res)=>{
    try{
        const newPost = new Post(req.body);
        newPost.username = req.user.username;
        const postMan = await Profile.findOne({username: req.user.username});
        postMan.posts.push(newPost);
        // save in Message collection table...
        const savePost = await newPost.save();
        // console.log(saveMessage);
        // save in Profile Collection table...
        await postMan.save();
        req.flash("success", "New Post created!!!");
        res.redirect("/home");
    }
    catch(err) {
        req.flash("error", "Post create failed!!!");
        res.redirect("/home/posts/new");
    }
});














// show post listing...
app.get("/home/posts", async (req, res)=>{
    const posts = await Post.find();
    const postPicture = process.env.DEFAULT_POST_IMAGE;
    // console.log(posts);
    res.render("posts.ejs", { posts, postPicture });
});

app.get("/home/posts/:id", (req, res)=>{
    res.render("show_individual_Posts.ejs");
});

app.get("/home/search", async(req, res)=>{
    const searchUsers = await Profile.find({id: ""});
    res.render("search.ejs", {searchUsers});
});

app.get("/home/profile/:username", (req, res) => {
    console.log("comes here get...");
    res.send(req.params.username);
});
app.post("/home/profile/:username", (req, res) => {
    console.log("comes here post...");
    res.send(req.params.username);
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

app.get("/home/:id/Message", (req, res)=>{
    res.render("sendMessage.ejs");
});

app.use("*", (req, res)=>{
    res.send("404: Page not Found");
})


app.listen(8080, ()=>{
    console.log(`Listening on port 8080, Alhamdulillah...!!!\n`);
})
