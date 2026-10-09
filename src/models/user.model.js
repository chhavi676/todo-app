const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    timestamps: true,
    versionKey: false,
})

user.pre('save', async function() {
    if(!this.isModified('password') || !this.password){
         return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

user.methods.comparePassword = async function (userPassword){
    return bcrypt.compare(userPassword, this.password)
}

const User = mongoose.model('User', user)

module.exports = User