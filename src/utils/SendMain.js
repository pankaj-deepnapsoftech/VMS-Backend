import ejs from 'ejs';
import { config } from '../config/env.config.js';
import { transporter } from '../config/nodeMailer.config.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SendMail = async (templatename, templateData, senderDetails) => {
  try {
    const newPath = path.join(__dirname, '..', 'templates', templatename);

    const html = await ejs.renderFile(newPath, templateData);

    const mailOptions = {
      from: config.EMAIL_ID,
      to: senderDetails.email,
      subject: senderDetails.subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Mail sent successfully');
  } catch (error) {
    console.error('Error sending mail:', error);
  }
};
