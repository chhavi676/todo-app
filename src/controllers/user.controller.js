const userService = require('../services/user.service');

const createUser = async (req, res) => {
    try {
        const data = await userService.createUser(req.body)
        return res.json(data)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const updateUser = async (req, res) => {
    try {
        const data = await userService.updateUser(req.userId, req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const deleteUser = async (req, res) => {
    try {
        const data = await userService.deleteUser(req.userId)
        return res.json(data)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const loginUser = async (req, res) => {
    try {
        const data = await userService.loginUser(req.body);
        return res.json(data)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {createUser, updateUser, deleteUser, loginUser}