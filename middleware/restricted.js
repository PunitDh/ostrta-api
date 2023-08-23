const { forbiddenResponse } = require("../domain/Response");
const { isAuthorized } = require("../utils/security");

module.exports = () => (req, res, next) =>
  isAuthorized({ _jwt: req.headers.authorization })
    ? next()
    : res.status(403).send(forbiddenResponse());
