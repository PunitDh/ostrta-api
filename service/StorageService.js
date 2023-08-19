const { Storage } = require("@google-cloud/storage");
const encoder = require("../utils/encoder");

const storage = new Storage({
  credentials: encoder.base64ToJson(process.env.GCLOUD_CREDENTIALS),
});

const StorageService = {
  uploadFile: async (filePath) => {
    try {
      const response = await storage
        .bucket(process.env.GCLOUD_STORAGE_BUCKET_NAME)
        .upload(filePath)
        .catch(console.error);
      return response;
    } catch (error) {
      return console.error(error);
    }
  },
};

module.exports = StorageService;
