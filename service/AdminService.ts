import { errorResponse, successResponse } from "../domain/APIResponse";
const Admin = require("../models/Setting").default;
import LogDAO from "../dao/LogDAO";

const AdminService = {
  getSettings: async () => {
    try {
      const settings = await Admin.findById(
        process.env.SITE_SETTINGS_OBJECT_ID
      );
      return successResponse(settings);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  saveSettings: async (request: { siteSettings: any }) => {
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
    } catch (error: any) {
      return errorResponse(error.message);
    }
  },

  getLogs: async (limit: number, type: string, time: string) => {
    const logs = await LogDAO.retrieveLogs(type, limit, time);
    return successResponse(logs);
  },

  clearLogs: async () => {
    const logs = await LogDAO.clearLogs();
    return successResponse(logs);
  },
};

export default AdminService;
