const User = require('../models/user.model');
const AuthHelper = require('../helpers/auth.helper')

const createUser = async (body) => {
    const user = await User.create(body);
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
        { new: true, runValidators: true }
    )
    if (!user) {
        throw new Error('User Not Found!');
    }
    return user
}

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new Error('User Not Found!');
    }
    return {
        message: 'User Removed Successfully!'
    }
}

const loginUser = async (body) => {
    const user = await User.findOne({
        email: String(body.email).toLowerCase()
    }, {
        _id: 1,
        password: 1,
        role: 1
    })
    if (!user || !user.password) {
        throw new Error("User doesn't Exists!");
    }
    const isMatch = user.comparePassword(body.password)
    if (!isMatch) {
        throw new Error('Invalid credentails!');
    }

    const token = AuthHelper.genAcessToken(user)
    return {
        id: user._id,
        token
    }
}

module.exports = { createUser, updateUser, deleteUser, loginUser }