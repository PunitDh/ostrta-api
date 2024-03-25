const { unauthorizedResponse } = require("../domain/APIResponse");
const { isAuthenticated } = require("../utils/security");

module.exports = () => (req, res, next) => {
  return isAuthenticated({ _jwt: req.headers.authorization })
    ? next()
    : res.status(401).send(unauthorizedResponse());
};
