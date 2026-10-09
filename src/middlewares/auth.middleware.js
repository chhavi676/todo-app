const AuthHelper = require('../helpers/auth.helper');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ') ){
        return res.status(401).json({
            success: false,
            message: 'Access Token is Missing!'
        })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decodedToken = AuthHelper.verifyAcessToken(token)
        if(decodedToken){
            req.userId = decodedToken.userId,
            req.role = decodedToken.role
        }
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = auth