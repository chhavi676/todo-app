const AuthHelper = require('../helpers/auth.helper');

/**
 * Auth middleware: verifies the Bearer access token in the `Authorization` header.
 * On success it sets `req.userId` and `req.role` from the token and calls `next()`.
 *
 * @param {import('express').Request} req - Express request; expects `Authorization: Bearer <token>`.
 * @param {res} res - Express response object.
 * @param {import('express').NextFunction} next - Passes control to the next handler.
 * @returns {void|res} 401 if the token is missing or invalid, otherwise nothing.
 */
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