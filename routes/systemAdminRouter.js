const express = require("express");
const router = express.Router({mergeParams: true});

const Post = require("../models/postSchema");
const Profile = require("../models/userProfileSchema");
const isSystemAdmin = require("../middleware/isSystemAdmin");

router.get("/", isSystemAdmin, async(req, res)=>{
    const posts = await Post.find({approved: 0});
    const profiles = await Profile.find();
    const totalAccount = profiles.length;
    let systemAdmin = 0, Volenteer = 0, NormalUser = 0, successfullDonation = 0;
    
    for (profile of profiles) {
        if (profile.role==1) ++systemAdmin;
        else if (profile.role==2) ++Volenteer;
        else ++NormalUser;
        successfullDonation += profile.contribution;
    }
    const totalPost = await (await Post.find()).length;
    res.render("systemAdminHomePage.ejs", {posts, totalAccount, systemAdmin, Volenteer, NormalUser, successfullDonation, totalPost});
});

router.post("/approved/:id", isSystemAdmin, async(req, res)=>{
    try {
        const id = req.params.id;
        // return res.send(id);
        await Post.updateOne({ _id: id }, { approved: 1 });
        res.redirect("/myhome");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;