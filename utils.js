const JWT = require("jsonwebtoken");

const verifyJWT = (jwt) => JWT.verify(jwt, process.env.JWT_SECRET);

module.exports = { verifyJWT };
