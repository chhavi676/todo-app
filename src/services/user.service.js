const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const AuthHelper = require('../helpers/auth.helper')

const createUser = async (body) => {
    const hashed = await bcrypt.hash(body.password, 10);
    const user = await User.create({
        name: body.name,
        email: body.email,
        password: hashed
    });
    const token = AuthHelper.genAcessToken(user)
    return {
        id: user._id,
        token
    }
}

const updateUser = async (userId, payload) => {
    const user = await User.findByIdAndUpdate(
            userId,
            payload,
            {new: true, runValidators: true}
        )
        if (!user){
            throw new Error('User Not Found!');
        }
        return user
}

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if(!user){
        throw new Error('User Not Found!');
    }
    return{
        message: 'User Removed Successfully!'
    }
}

const loginUser = async (body) => {
    console.log(body);
    const user = await User.findOne({
        email: String(body.email).toLowerCase()
    }, {
        _id: 1,
        password: 1,
        role: 1
    })
        console.log(user);
        if(!user || !user.password ){
            throw new Error("User doesn't Exists!");
        }
    const isMatch = await bcrypt.compare(body.password, user.password)
    if (isMatch){
        const token = AuthHelper.genAcessToken(user)
        return {
            id: user._id,
            token
        }
    }
    else{
        throw new Error('Invalid credentails!');
    }
}

module.exports = {createUser, updateUser, deleteUser, loginUser}