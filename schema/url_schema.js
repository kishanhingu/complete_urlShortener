import mongoose from "mongoose";

const urlSchema = mongoose.Schema(
  {
    id: { type: Number },
    url: { type: String },
    shortCode: { type: String },
  },
  { timestamps: true }
);

export const URL = mongoose.model("shortener_mongoose", urlSchema);
