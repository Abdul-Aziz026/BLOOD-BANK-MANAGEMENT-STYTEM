const mongoose = require('mongoose');
// const passportLocalMongoose = require('passport-local-mongoose');

const donorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    role: {
        type: Number,
        default: 3
    },
    bloodgroup: {
        type: String,
        // enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
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
    }
});


// profileSchema.plugin(passportLocalMongoose);

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
