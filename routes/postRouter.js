const express = require("express");
const router = express.Router({mergeParams: true});


const isLoggedIn = require("../middleware/isLoggedIn");


const Post = require("../models/postSchema");

// show post page...
router.get("/", async (req, res)=>{
    const posts = await Post.find({approved: 1});
    // const postPicture = process.env.DEFAULT_POST_IMAGE;
    let postUser = undefined;
    if (req.session.user) postUser = req.session.user;
    res.render("posts.ejs", { posts, postUser });
});

// create post
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("create_post.ejs");
});

router.post("/new", isLoggedIn, async(req, res)=>{
    try{
        const newPost = new Post(req.body);
        newPost.username = req.session.user.username;
        const savePost = await newPost.save();
        req.flash("success", "New Post created!!!");
        res.redirect("/posts");
    }
    catch(err) {
        req.flash("error", "Post create failed!!!");
        res.redirect("/posts");
    }
});


router.get("/edit/:id", isLoggedIn, async(req, res)=>{
    try {
        const id = req.params.id;
        const post = await Post.findOne({_id: id});
        if (req.session.user.username === post.username) {
            const editPost = await Post.findOne({_id: id});
            // res.send(editPost);
            res.render("editPost.ejs", {editPost});
        }
        else {
            req.flash("error", "You are not the author of this Post...");
            res.redirect("/posts");
        }
        // res.send("ok");
    }
    catch(err) {
        console.log(req.user);
        res.send('error');
    }
});
router.post("/edit/:id", isLoggedIn, async(req, res)=>{
    // res.send("Post updated");
    const Postid = req.params.id;
    try {
        // return res.send(req.body);
        const post = await Post.findById(Postid);
        if (req.session.user.username === post.username) {
            // Create a new object excluding the _id field from req.body
            const editPost = {...req.body};
            // console.log(editPost);
            delete editPost._id; // Exclude _id field from the update
            editPost.username = req.session.user.username;
            const updatedPost = await Post.findByIdAndUpdate(Postid, editPost, { new: true });
            // console.log(updatedPost);
            res.redirect("/posts");
        }
        else {
            req.flash("error", "You are not the author of this Post...");
            res.redirect("/posts");
        }
    }
    catch(err) {
        return res.send(err.message);
        req.flash("error", "Some thing Wrong happened...");
        res.redirect("/posts");
    }
});

module.exports = router;