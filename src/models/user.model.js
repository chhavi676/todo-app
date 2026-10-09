const mongoose = require('mongoose');

const user = new mongoose.Schema({
    name: {
        type: String ,
        required: true,
        trim: true,
        maxLength: 100
    },
    email: {
        type: String ,
        unique: true,
        lowercase: true,
        required: true,
        trim: true,
        maxLength: 100
    },
    password: {
        type: String ,
        required: true,
        trim: true,
        minLength: 8,
        select: false
    },
    role: {
        type: String ,
        enum: ['user', 'admin'],
        default: 'user'
    }
},{
    timestamps: true
})

const User = mongoose.model('User', user)

module.exports = User