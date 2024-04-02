const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bloodgroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    weight: {
        type: Number
    },
    phone: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    age: {
        type: Number
    },
    donor: {
        type: String,
        default: false
    },
    department: {
        type: String,
    },
    division: {
        type: String
    },
    district: {
        type: String
    },
    contribution: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    }
});


profileSchema.plugin(passportLocalMongoose);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
