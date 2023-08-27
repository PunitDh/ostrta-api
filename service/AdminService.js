const { errorResponse, successResponse } = require("../domain/Response");
const Admin = require("../models/Setting");
const LogDAO = require("../dao/LogDAO");

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

  getLogs: async (limit, type) => {
    const messages = await LogDAO.retrieveLogs(type, limit);
    return successResponse(messages);
  },

  clearLogs: async () => {
    const messages = await LogDAO.clearLogs();
    return successResponse(messages);
  },
};

module.exports = AdminService;
