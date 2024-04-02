const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true
    },
    unitsRequired: {
        type: Number,
        required: true
    },
    patientType: {
        type: String,
        required: true
    },
    hospital: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    }
});

const Post = mongoose.model('Post', bloodRequestSchema);

module.exports = Post;
