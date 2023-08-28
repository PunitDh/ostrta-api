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
      return errorResponse(error.message);
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
      return errorResponse(error.message);
    }
  },

  getLogs: async (limit, type, time) => {
    const logs = await LogDAO.retrieveLogs(type, limit, time);
    return successResponse(logs);
  },

  clearLogs: async () => {
    const logs = await LogDAO.clearLogs();
    return successResponse(logs);
  },
};

module.exports = AdminService;
