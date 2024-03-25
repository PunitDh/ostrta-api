import { errorResponse, successResponse } from "../domain/APIResponse";
import RecipePreference from "../models/RecipePreference";

const RecipeService = {
  setSettings: async (playerId: string, dietaries: string[], intolerances: string[]) => {
    try {
      let recipeStats: any = await RecipePreference.find({ playerId });
      if (!recipeStats) {
        recipeStats = await RecipePreference.create({
          playerId,
          dietaries,
          intolerances,
        });
      } else {
        recipeStats.dietaries = dietaries;
        recipeStats.intolerances = intolerances;
      }
      await recipeStats.save();
      return successResponse(recipeStats);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  getSettings: async (playerId: string) => {
    try {
      const settings = await RecipePreference.find({ playerId });
      return successResponse(settings);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },
};

export default RecipeService;
