const { unauthorizedResponse } = require("../domain/Response");
const { isAuthenticated } = require("../utils");

module.exports = () => (req, res, next) => {
  console.log(req.headers);
  return isAuthenticated({ _jwt: req.headers.authorization })
    ? next()
    : res.status(401).send(unauthorizedResponse());
};
