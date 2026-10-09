const jwt = require('jsonwebtoken');

const payload = {
    id: '12334',
    role: 'admin'
}

const secretKey = '098765432112345678999990hgfdszxnmjuytrfd'

const token = jwt.sign(payload, secretKey, {
    expiresIn: '15m',
    issuer: 'chhavi'
})

const verify = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzM0Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxMzEwMTAwLCJleHAiOjE3OTEzMTEwMDAsImlzcyI6ImNoaGF2aSJ9.BLrxAOZrLlV64EPAtyilNoU7VizGZMQW1QFlgJ5tAoM", secretKey, {
    algorithms: ["HS256"],
    issuer: "chhavi"
})
console.log(token);
console.log(verify);
