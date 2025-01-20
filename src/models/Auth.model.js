import { Schema, model } from 'mongoose';
import  { hash } from "bcrypt";

const AuthSchema = new Schema({
  full_name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['Customer', 'Employee', 'Admin'],
  },
  otp: { type: Number },
  Allowed_path: { type: [String] },
  email_verification: { type: Boolean, required: true, default: false },
  Login_verification: { type: Boolean, required: true, default: false },
});

AuthSchema.pre("save",async function (next) {
    if(!this.isModified("password")) next();
    const hash = await hash(this.password,12)
    this.password = hash
})


export const AuthModel = model("User",AuthSchema)