const mongoose = require('mongoose');

// c++ define type
const Schema = mongoose.Schema;

const profileSchema = new Schema({
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
    role: {
        type: Number,
        default: 3
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
    lastDonateTime: {
        type: Date,
    },
    message: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message",
        }
    ]
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
