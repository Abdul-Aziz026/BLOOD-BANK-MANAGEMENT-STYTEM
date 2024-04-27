const express = require("express");
const router = express({mergeParams: true});

const Profile = require("../models/userProfileSchema");
const isSystemAdmin = require("../middleware/isSystemAdmin.js");

router.get("/", isSystemAdmin, async(req, res)=> {
    const users = await Profile.find();
    res.render("userList.ejs", {users});
});

router.get("/:username", isSystemAdmin, async(req, res)=>{
    const userName = req.params.username;
    const profile = await Profile.findOne({username: userName});
    console.log("p = ", profile);
    res.render("roleUpdateProfile.ejs", {profile});
});

router.post("/:username", isSystemAdmin, async(req, res)=>{
    // return res.send(req.body);
    const userName = req.params.username;
    const Newrole = req.body.role;
    console.log(Newrole);
    const newData = await Profile.updateOne(
        { username: userName },
        { $set: { role: Newrole }});
    // return res.send(newData);
    const profile = await Profile.findOne({username: userName});
    res.render("roleUpdateProfile.ejs", {profile});
});

router.post("/delete/:username", isSystemAdmin, async (req, res) => {
    try {
        const userName = req.params.username;
        console.log("Username: ", userName); // Corrected variable name
        const deletedProfile = await Profile.findOneAndDelete({ username: userName });
        // delete post
        const Post = require("../models/postSchema");
        await Post.deleteMany({username: userName});
        // delete message
        const Message = require("../models/messageSchema");
        await Message.deleteMany({ $or: [ { sender: userName }, { receiver: userName } ] });

        req.flash("success", "Deleted the user successfully!"); // Removed unnecessary punctuation
        res.redirect("/users");
    } catch (error) {
        req.flash("error", "Failed to delete the user."); // Flash an error message
        res.redirect("/users");
    }
});


router.post("/updaterole/:username", isSystemAdmin, async(req, res)=>{
    res.send(req.body);
});



module.exports = router;