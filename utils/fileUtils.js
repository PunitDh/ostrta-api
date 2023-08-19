module.exports = {
  extractName: function (originalname) {
    return originalname.split(".").slice(0, -1).join(".").split(" ").join("-");
  },
};
