const User = require("../models/user.model");
const AuthHelper = require("../helpers/auth.helper");
const RefreshToken = require("../models/refresh.token");
const TokenHelper = require("../helpers/token.helper");
const refreshToken = require("../models/refresh.token");

const createUser = async (body) => {
  const user = await User.create(body);
  const token = AuthHelper.genAcessToken(user);
  return {
    id: user._id,
    token,
  };
};

const updateUser = async (userId, payload) => {
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new Error("User Not Found!");
  }
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User Not Found!");
  }
  return {
    message: "User Removed Successfully!",
  };
};

const loginUser = async (body, meta) => {
  const user = await User.findOne(
    {
      email: String(body.email).toLowerCase(),
    },
    {
      _id: 1,
      password: 1,
      role: 1,
    },
  );
  if (!user || !user.password) {
    throw new Error("User doesn't Exists!");
  }
  const isMatch = await user.comparePassword(body.password);
  if (!isMatch) {
    throw new Error("Invalid credentails!");
  }

  const { accessToken, refreshToken } = await _issueTokens(user, meta);


  return {
    id: user._id,
   accessToken,
   refreshToken
  };
};

const _issueTokens = async (user, meta = {}) => {
  const accessToken = AuthHelper.genAcessToken(user);

  const refreshToken = TokenHelper.generateRefreshToken();
  await RefreshToken.create({
    userId: user._id,
    tokenHash: TokenHelper.hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent : meta.userAgent,
    ip : meta.ip
  });
  return {
    accessToken,
    refreshToken
  }
};

const refresh = async (token, meta) => {
  if (!token) {
    throw new Error("Refresh token missing!!");
  }
  const tokenHash = TokenHelper.hashToken(token);
  const storedToken = await RefreshToken.findOneAndDelete({ tokenHash });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error("Expired or invalid refresh token!!");
  }

  const user = await User.findById(storedToken.userId);
  if(!user){
    throw new Error('User not found!!')
  }

  return _issueTokens(user, meta)
};

const logoutUser = async(refreshToken) => {
  if(!refreshToken){
    return 
  }

   const tokenHash = TokenHelper.hashToken(refreshToken);

  await RefreshToken.deleteOne({tokenHash})
}

module.exports = { createUser, updateUser, deleteUser, loginUser, refresh, logoutUser, _issueTokens };
