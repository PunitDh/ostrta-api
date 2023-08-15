const { errorResponse, successResponse } = require("../domain/Response");
const Admin = require("../models/Setting");

const AdminService = {
  getSettings: async () => {
    try {
      const settings = await Admin.findById(
        process.env.SITE_SETTINGS_OBJECT_ID
      );
      return successResponse(settings);
    } catch (error) {
      return errorResponse("Something went wrong");
    }
  },
  saveSettings: async (siteSettings) => {
    try {
      const settings = await Admin.findByIdAndUpdate(
        process.env.SITE_SETTINGS_OBJECT_ID,
        siteSettings,
        { returnDocument: "after" }
      );
      return successResponse(settings);
    } catch (error) {
      return errorResponse("Something went wrong");
    }
  },
};

module.exports = AdminService;
