const express = require("express");
const router = express.Router({mergeParams: true});

// middleware
const isLoggedIn = require("../middleware/isLoggedIn");

// mongoose model...
const Message = require("../models/messageSchema");

router.get("/:username", isLoggedIn, async(req, res)=>{
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
router.get("/:username/p2", isLoggedIn, async(req, res) => {
    const sender = req.session.user.username;
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
router.post("/:username/p2", isLoggedIn, async (req, res) => {
    try {
        const sender = req.session.user.username;
        const receiver = req.params.username;
        const {message} = req.body;

        const newMessage = new Message({
            sender: sender,
            receiver: receiver,
            message: message
        });
        
        const saveMessage = await newMessage.save();
        // console.log(saveMessage);
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