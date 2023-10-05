import { NextFunction, Request, Response } from "express";
import { forbiddenResponse } from "../domain/Response";
import { isAuthorized } from "../utils/security";

export default function restricted() {
  return (req: Request, res: Response, next: NextFunction) =>
    isAuthorized({ _jwt: req.headers.authorization })
      ? next()
      : res.status(403).send(forbiddenResponse());
}
