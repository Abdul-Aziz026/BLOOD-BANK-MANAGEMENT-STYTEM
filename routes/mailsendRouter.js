const express = require("express");
const router = express.Router({mergeParams: true});
const nodemailer = require("nodemailer");

const isLoggedIn = require("../middleware/isLoggedIn");

// mode require...
const Profile = require("../models/userProfileSchema");

/* Mail send Route */
router.get("/:username", isLoggedIn, async(req, res) => {
    const sender = req.session.user.username;
    const receiver = req.params.username;
    // console.log("sender & receiver", sender, receiver);
    res.render("sendMail.ejs", {sender, receiver});
});

router.post("/:username", isLoggedIn, async (req, res) => {
    const sender = req.session.user.username;
    const receiver = req.params.username;
    const senderMail = req.session.user.email;
    const {email} = await Profile.findOne({username: receiver});
    const mailsubject = req.body.mailSubject;
    const mailMessage = req.body.mailMessage;
    const receiverMail = email;

    // first send mail 
    let transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // const toEmail = "azizurcsebsmrstu@gmail.com" ;
    console.log(email, process.env.EMAIL_USERNAME);
    const mailOptions = {
        from: process.env.EMAIL_USERNAME, // Sender address
        to: receiverMail, // List of recipients
        subject: mailsubject, // Subject line
        text: mailMessage // Plain text body
    };
    
    // transport.sendMail(mailOptions, function(err, info) {
    //     if (err) {
    //         console.log("error is => " + err.message);
    //     } else {
    //         console.log("send mail successfully!");
    //     }
    // });
    req.flash("success", "Successfully Send Mail...!!!");
    res.redirect(`/profile/${receiver}`);
    // return res.send({senderMail, receiverMail, subject, mailSubject});
});

module.exports = router;