const userService = require("../services/user.service");
const {
  handleSuccess,
  handleError,
  handleOk,
} = require("../helpers/response.helper");

const REFRESH_COOKIE = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "strict",
  path: "/users",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createUser = async (req, res) => {
  try {
    const data = await userService.createUser(req.body);
    return handleSuccess(res, data);
  } catch (error) {
    return handleError(res, error);
  }
};
const updateUser = async (req, res) => {
  try {
    const data = await userService.updateUser(req.userId, req.body);
    return handleOk(res, data);
  } catch (error) {
    return handleError(res, error);
  }
};
const deleteUser = async (req, res) => {
  try {
    const data = await userService.deleteUser(req.userId);
    return handleOk(res, data);
  } catch (error) {
    return handleError(res, error);
  }
};
const loginUser = async (req, res) => {
  try {
    const data = await userService.loginUser(req.body, {
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });

    res.cookie(REFRESH_COOKIE, data.refreshToken, cookieOptions);

    return handleOk(res, data);
  } catch (error) {
    return handleError(res, error);
  }
};

const logoutUser = async (req, res) => {
  try {

    await userService.logoutUser(req.cookies[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: "/users" });
    return handleOk(res);
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = { createUser, updateUser, deleteUser, loginUser, logoutUser };
