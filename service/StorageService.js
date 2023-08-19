const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  credentials: {
    type: process.env.GCLOUD_STORAGE_TYPE,
    private_key: process.env.GCLOUD_STORAGE_PRIVATE_KEY,
    client_email: process.env.GCLOUD_STORAGE_CLIENT_EMAIL,
    client_id: process.env.GCLOUD_STORAGE_CLIENT_ID,
    project_id: process.env.GCLOUD_STORAGE_PROJECT_ID,
  },
});

const StorageService = {
  uploadFile: async (filePath) => {
    try {
      const response = await storage
        .bucket(process.env.GCLOUD_STORAGE_BUCKET_NAME)
        .upload(filePath);
      return response;
    } catch (error) {
      return console.error(error);
    }
  },
};

module.exports = StorageService;
