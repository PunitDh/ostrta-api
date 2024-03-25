import express, { Request, Response } from "express";
import secured from "../middleware/secured";
import RecipeService from "../service/RecipeService";
import { decodeJWT } from "../utils/security";
const recipeRouter = express.Router();

recipeRouter.get(
  "/settings",
  secured(),
  async (req: Request, res: Response) => {
    const decoded = decodeJWT(req.headers.authorization!);
    const response = await RecipeService.getSettings(decoded.id);
    return res.status(response.code).send(response);
  }
);

recipeRouter.post(
  "/settings",
  secured(),
  async (req: Request, res: Response) => {
    const decoded = decodeJWT(req.headers.authorization!);
    const { dietaries, intolerances } = req.body;
    const response = await RecipeService.setSettings(
      decoded.id,
      dietaries,
      intolerances
    );
    return res.status(response.code).send(response);
  }
);

module.exports = recipeRouter;
