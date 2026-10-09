/**
 * Logger middleware: logs each request's method, URL, status code and
 * response time (ms) to the console once the response is finished.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {res} res - Express response object.
 * @param {import('express').NextFunction} next - Passes control to the next handler.
 * @returns {Promise<void>}
 */
const logger = async(req, res, next) =>{
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now()-start
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms}ms`);        
    })
    next();
}

module.exports = logger