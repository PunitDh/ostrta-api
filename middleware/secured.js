import { NextFunction, Request, Response } from "express";
import { unauthorizedResponse } from "../domain/Response";
import { isAuthenticated } from "../utils/security";

function secured() {
  return (req, res, next) =>
    isAuthenticated({ _jwt: req.headers.authorization })
      ? next()
      : res.status(401).send(unauthorizedResponse());
}

module.exports = secured;
