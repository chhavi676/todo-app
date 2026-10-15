const crypto = require('crypto');

class TokenHelper {
    static generateRefreshToken (){
       return crypto.randomBytes(40).toString('hex')
    }

    static hashToken (token){
      return crypto.createHash('SHA256').update(token).digest('hex')
    }
}

module.exports = TokenHelper