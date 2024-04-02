const express = require("express");
const router = express.Router({mergeParams: true});


const isLoggedIn = require("../middleware/isLoggedIn");


const Post = require("../models/postSchema");

// show post page...
router.get("/", async (req, res)=>{
    const posts = await Post.find();
    // const postPicture = process.env.DEFAULT_POST_IMAGE;
    const postUser = req.session.user;
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
        // postMan.posts.push(newPost);
        // save in Message collection table...
        const savePost = await newPost.save();
        // save in Profile Collection table...
        // await postMan.save();
        req.flash("success", "New Post created!!!");
        res.redirect("/home");
    }
    catch(err) {
        req.flash("error", "Post create failed!!!");
        res.redirect("/home/posts/new");
    }
});


router.get("/posts/edit/:id", isLoggedIn, async(req, res)=>{
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
    }
    catch(err) {
        console.log(req.user);
        res.send('error');
    }
});
router.post("posts/edit/:id", isLoggedIn, async(req, res)=>{
    // res.send("Post updated");
    const id = req.params.id;
    try {
        const post = await Post.findOne({_id: id});
        if (req.session.user.username === post.username) {
            const cpost = req.session.body;
            // res.send(Profile);
            const editPost = await Post.findOne({_id: id});
            await Post.findByIdAndUpdate(editPost._id, cpost);
            res.redirect("/posts");
        }
        else {
            req.flash("error", "You are not the author of this Post...");
            res.redirect("/posts");
        }
    }
    catch(err) {
        req.flash("error", "Some thing Wrong happened...");
        res.redirect("/home/posts");
    }
});

module.exports = router;