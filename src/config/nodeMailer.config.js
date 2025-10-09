import nodemailer from "nodemailer";
import { config } from "./env.config.js";

export const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',  // Hostinger SMTP server
  port: 587,                   // Use 587 for TLS encryption
  secure: false,               // TLS encryption (false for 587, true for 465)
  auth: {
    user: config.EMAIL_ID,     // Your Hostinger email address
    pass: config.EMAIL_PASSWORD,  // Your Hostinger email password
  },
});