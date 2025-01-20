import ejs from 'ejs';
import { config } from '../config/env.config.js';
import { transporter } from '../config/nodeMailer.config.js';

export const SendMail = async (templatePath, templateData, senderDetails) => {
  const html = await ejs.renderFile(templatePath, templateData);

  const mailOptions = {
    from: `${config.EMAIL_ID}`,
    to: `${senderDetails.email}`,
    subject: `${senderDetails.subject}`,
    html: html,
  };
  await transporter.sendMail(mailOptions)
  console.log("mail send")
};
