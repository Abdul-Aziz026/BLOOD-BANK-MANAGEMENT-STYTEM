const express = require("express");
const router = express.Router({mergeParams: true});

// middleware
const isLoggedIn = require("../middleware/isLoggedIn");

// mongoose model...
const Message = require("../models/messageSchema");
const Profile = require("../models/userProfileSchema");

router.get("/:username", isLoggedIn, async(req, res)=>{
    const userName = req.params.username;
    const betweenMessages = await Profile.findOne({username: userName}).populate('message');
    // console.log(betweenMessages.message);
    res.render("showMsg.ejs", {betweenMessages: betweenMessages.message});
});

// send message and show message...
router.get("/:username/p2", isLoggedIn, async(req, res) => {
    const sender = req.session.user.username;
    const receiver = req.params.username;
    console.log("sender & receiver", sender, receiver);
    // return res.send( receiver);
    // const betweenMessages = await Message.find({
    //     $or: [
    //         { $and: [{ sender: sender }, { receiver: receiver }] },
    //         { $and: [{ sender: receiver }, { receiver: sender }] }
    //     ]
    // });
    
    const betweenMessages = await Profile.findOne({username:sender}).populate({
        path: "message",
        match: {
            $or: [
                { sender: receiver },
                { receiver: receiver }
            ]
        }
    });
    // return res.send(betweenMessages.message);
    res.render("sendMessage.ejs", {sender, receiver, betweenMessages: betweenMessages.message});
});

// send message and show message...
router.post("/:username/p2", isLoggedIn, async (req, res) => {
    try {
        const sender = req.session.user.username;
        const receiver = req.params.username;
        const {message} = req.body;
        const profiles = await Profile.findOne({username: sender});
        const newMessage = new Message({
            sender: sender,
            receiver: receiver,
            message: message
        });
        profiles.message.push(newMessage);
        await newMessage.save();
        await profiles.save();
        
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
        res.redirect(`/message/${req.params.username}/p2`);
    };
});


module.exports = router;