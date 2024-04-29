const express = require("express");
const router = express.Router({mergeParams: true});

// this is for csv file upload in database...
const app = express();
const csv=require('csvtojson')
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
// csv part end...


const Post = require("../models/postSchema");
const Profile = require("../models/userProfileSchema");
const Donor = require("../models/donerSchema");
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

router.post('/upload', async (req, res) => {
    if (!req.files) {
        res.redirect("/myhome");
        // return res.status(400).send('No files were uploaded.');
    }

    const csvFile = req.files.csv;
    // return res.send(csvFile);

    // Move the uploaded file to a temporary location
    const tempFilePath = csvFile.name;
    csvFile.mv(tempFilePath, async function(err) {
        if (err) {
            req.flash("error", `${err.message}`);
            return res.redirect("/myhome");
        }
        try {
            // Convert CSV to JSON
            const jsonObj = await csv().fromFile(tempFilePath);

            // Log the JSON object to check its structure
            // console.log(jsonObj);
            // Adjust the mapping before saving data to the database
            try {
                let result = [];
                let updateUser = 0, notUpdateUser = 0;
                for (obj of jsonObj) {
                    // console.log(obj.email);
                    const ExistThisUser = await Donor.find({email: obj.email});
                    // console.log("newUser = ", newUser);
                    if (ExistThisUser) {
                        notUpdateUser += 1;
                    }
                    else {
                        const newUser = new Donor(obj);
                        updateUser += 1;
                        const cur = await newUser.save();
                        result.push(cur);
                    }
                }
                let msg = "Your CSV file all data update successfully...";
                req.flash("success", `${msg} Update User ${updateUser} Not updateuser  ${notUpdateUser}`);
                // Send success response
                res.redirect("/myhome");
            } catch (error) {
                // Log the error
                req.flash("error", `Hello ${error.message}`);
                
                // Send error response
                res.redirect("/myhome");
            }
        } catch (error) {
            // Log the error
            console.error('Error:', error);

            // Send error response
            res.status(500).send(error.message);
        }
    });
});

module.exports = router;