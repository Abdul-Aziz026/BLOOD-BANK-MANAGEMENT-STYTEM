const express = require("express");
const router = express.Router({mergeParams: true});

const Profile = require("../models/userProfileSchema.js");
const Donor = require("../models/donerSchema.js");

router.get("/search", async(req, res)=>{
    const searchUsers = await Profile.find({id: ""});
    res.render("search.ejs", {searchUsers});
});

router.post("/search", async (req, res) => {
    const {division, district, bloodgroup} = req.body;
    // console.log("data ", division, district, bloodgroup);
    const searchUsers = await Donor.find({$and: [{
        bloodgroup: bloodgroup },
        {
            $or: [
            { district: district },
            { division: division }
            ]
        }
    ]});
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const registerUserSearch = await Profile.find({
        bloodgroup: bloodgroup,
        $or: [
            { district: district },
            { division: division }
        ],
        lastDonateTime: { $lte: ninetyDaysAgo }
    });
    
    // console.log(registerUserSearch);

    for (reg of searchUsers) {
        registerUserSearch.push(reg);
    }
    // console.log(searchUsers);
    res.render("search.ejs", {searchUsers: registerUserSearch});
});
module.exports = router;