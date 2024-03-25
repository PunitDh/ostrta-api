import { NextFunction, Request, Response } from "express";
import { unauthorizedResponse } from "../domain/APIResponse";
import { isAuthenticated } from "../utils/security";

export default function secured() {
  return (req: Request, res: Response, next: NextFunction) =>
    isAuthenticated({ _jwt: req.headers.authorization })
      ? next()
      : res.status(401).send(unauthorizedResponse());
}
