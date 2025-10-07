import { Schema } from "mongoose";


export const ImageSchem = new Schema({
  image_url: { type: String },
  image_id: { type: String }
});