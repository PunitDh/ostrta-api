import JWT from "jsonwebtoken";

/**
 *
 * @param {String} jwt
 * @returns {Object}
 */
export const decodeJWT = (jwt: string): any => {
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
export const isAuthenticated = (request: any) =>
  Boolean(decodeJWT(request._jwt));

export const isAuthorized = (request: any) =>
  Boolean(decodeJWT(request._jwt).isAdmin);
