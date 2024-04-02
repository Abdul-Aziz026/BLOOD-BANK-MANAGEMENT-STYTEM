require('dotenv').config();
const mongoose = require("mongoose");

// mongo connection check
const MONGO_URL = process.env.MONGO_URL;

main()
.then(() => console.log("connection Successfull in database."))
.catch((err) => {
    console.log(err)
});
async function main() {
  await mongoose.connect(MONGO_URL);
}