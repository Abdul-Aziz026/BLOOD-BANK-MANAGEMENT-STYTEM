const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageLink: {
        type: String,
    },
    patientType: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
