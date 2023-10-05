
const bcrypt = require("bcrypt");
const RecipePreference = require("../models/RecipePreference");

const RecipeDAO = {
  register: async function (request) {
    return await RecipePreference.create({
      
    });
  }
};

module.exports = RecipeDAO;
