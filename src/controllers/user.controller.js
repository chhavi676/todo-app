const userService = require('../services/user.service');
const { handleSuccess, handleError, handleOk } = require("../helpers/response.helper");

const createUser = async (req, res) => {
    try {
        const data = await userService.createUser(req.body)
        return handleSuccess(res, data)
    } catch (error) {
        return handleError(res, error)
    }
}
const updateUser = async (req, res) => {
    try {
        const data = await userService.updateUser(req.userId, req.body);
        return handleOk(res, data)
    } catch (error) {
        return handleError(res, error)
    }
}
const deleteUser = async (req, res) => {
    try {
        const data = await userService.deleteUser(req.userId)
        return handleOk(res, data)
    } catch (error) {
        return handleError(res, error)
    }
}
const loginUser = async (req, res) => {
    try {
        const data = await userService.loginUser(req.body);
        return handleOk(res, data)
    } catch (error) {
        return handleError(res, error)
    }
}

module.exports = {createUser, updateUser, deleteUser, loginUser}
