const jwt = require("jsonwebtoken");

class AuthHelper {
  static genAcessToken(user) {
    console.log(user)
    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
      issuer: "chhavi",
    });
  }

  static verifyAcessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "chhavi"
    })
  }
}

module.exports = AuthHelper