const authService = require("../services/auth.service");
const {
  handleSuccess,
  handleError,
  handleOk,
} = require("../helpers/response.helper");

const googleRedirect = async (req, res) => {
  try {
    const { state, params } = await authService.googleRedirect();
    res.cookie("oauth_state", state);
    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!state || req.cookies.oauth_state !== state) {
      return res.status(400).json({
        success: false,
        message: "Invalid oauth state",
      });
    }
    res.clearCookie("oauth_state");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokens = await tokenRes.json();

    const profileRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const profile = await profileRes.json();

    if (!profile.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email not verified!!",
      });
    }

    const data = await authService.googleCallback(profile, {
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });

    return handleSuccess(res, data);
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  googleRedirect,
  googleCallback,
};
