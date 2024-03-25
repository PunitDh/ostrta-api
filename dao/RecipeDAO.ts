import RecipePreference from "../models/RecipePreference";

const RecipeDAO = {
  register: async function (request: any) {
    return await RecipePreference.create({});
  },
};

export default RecipeDAO;
