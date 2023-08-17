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
  saveSettings: async (request) => {
    try {
      const settings = await Admin.findById(
        process.env.SITE_SETTINGS_OBJECT_ID
      );
      settings.siteSettings = {
        ...settings.siteSettings,
        ...request.siteSettings,
      };
      await settings.save();
      return successResponse(settings);
    } catch (error) {
      return errorResponse("Something went wrong", error);
    }
  },
};

module.exports = AdminService;
