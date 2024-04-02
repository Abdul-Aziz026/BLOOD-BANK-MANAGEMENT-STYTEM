const express = require("express");
const router = express.Router({mergeParams: true});


const isLoggedIn = require("../middleware/isLoggedIn");


const Post = require("../models/postSchema");

// show post page...
router.get("/", async (req, res)=>{
    const posts = await Post.find();
    const postPicture = process.env.DEFAULT_POST_IMAGE;
    res.render("posts.ejs", { posts, postPicture });
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

module.exports = router;