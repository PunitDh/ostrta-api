import { Schema, model } from "mongoose";

const Setting = new Schema(
  {
    siteSettings: {
      conversations: {
        type: Boolean,
        default: false,
      },
      videoConverter: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export default model("Setting", Setting);
