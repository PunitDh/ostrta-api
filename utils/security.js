const JWT = require("jsonwebtoken");

/**
 *
 * @param {String} jwt
 * @returns {Object}
 */
const decodeJWT = (jwt) => {
  try {
    return JWT.verify(jwt, process.env.JWT_SECRET);
  } catch (e) {
    return false;
  }
};

/**
 *
 * @param {Object} request
 * @param {String} request._jwt
 * @returns {Boolean}
 */
const isAuthenticated = (request) => Boolean(decodeJWT(request._jwt));

const isAuthorized = (request) => Boolean(decodeJWT(request._jwt).isAdmin);

module.exports = {
  decodeJWT,
  isAuthenticated,
  isAuthorized,
};
