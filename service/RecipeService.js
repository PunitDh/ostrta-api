const { errorResponse, successResponse } = require("../domain/Response");
const RecipePreference = require("../models/RecipePreference");

const RecipeService = {
  setSettings: async (playerId, dietaries, intolerances) => {
    try {
      let recipeStats = await RecipePreference.find({ playerId });
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
    } catch (error) {
      return errorResponse(error.message);
    }
  },

  getSettings: async (playerId) => {
    try {
      const settings = await RecipePreference.find({ playerId });
      return successResponse(settings);
    } catch (error) {
      return errorResponse(error.message);
    }
  },
};

module.exports = RecipeService;
