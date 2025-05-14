import { Schema, model } from "mongoose";

const BookDemoSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date},
  message: { type: String},
},{timestamps:true});

export const BookDemoModal = model("BookDemo", BookDemoSchema);