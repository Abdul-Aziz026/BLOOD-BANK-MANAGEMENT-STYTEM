const express = require("express");
const app = express();


const Profile = require("./models/profile.js");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

const bcrypt = require('bcrypt');
dotenv.config();
const saltRounds = 10;

app.use(express.urlencoded({extended: true}));

main()
.then(() => console.log("connection Successfull"))
.catch((err) => {
    console.log(err)
});
async function main() {
  await mongoose.connect('mongodb+srv://alhamdulillah026:alhamdulillah026@cluster0.xvjeezh.mongodb.net/Bld');
}

// signup route
app.get("/signup", async(req, res)=>{
    console.log("user params Name: ", req.body.name);
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
    const profile1 = new Profile({
        name: req.body.name,
        password: hashPassword,
    });

    profile1.save()
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log("Some error occur!");
    });
    res.send(req.body);
});


// login route
app.post("/login", async(req, res)=>{
    console.log("user name: ", req.body.name);
    const user = await Profile.find({ name: req.body.name });
    console.log("get User: ", user);
    if (user && user.length > 0) {
        const isValid = await bcrypt.compare(req.body.password, user[0].password);
        if (isValid) {
            const Token = jwt.sign({
                name: user[0].name,
                id: user[0]._id,
            }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });
            console.log("login successfully");
            res.send(`token: ${Token} username: ${user[0].name}`);
        } else {
            console.log("password is wrong");
            res.send("password is wrong");
        }
    } else {
        console.log("Invalid UserName");
        res.send("Invalid UserName");
    }
});


app.listen(8080, ()=>{
    console.log(`Listening on port 8080, Alhamdulillah...!!!\n`);
})
