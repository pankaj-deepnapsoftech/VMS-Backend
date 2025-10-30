import ejs from 'ejs';
import { config } from '../config/env.config.js';
import { transporter } from '../config/nodeMailer.config.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SendMail = async (templatename, templateData, senderDetails) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', templatename);

    const html = await ejs.renderFile(templatePath, templateData);

    let attachments = [];

    if (senderDetails.attachments && Array.isArray(senderDetails.attachments)) {
      attachments = senderDetails.attachments.map(att => {
        if (att.path) {
          // Ensure file exists
          if (!fs.existsSync(att.path)) {
            throw new Error(`Attachment file not found: ${att.path}`);
          }
          return {
            filename: att.filename || path.basename(att.path),
            path: att.path,
            contentType: att.contentType || 'application/octet-stream',
          };
        } else if (att.content) {
          // Must be string, Buffer, or Stream
          return {
            filename: att.filename,
            content: att.content,
            contentType: att.contentType || 'application/octet-stream',
          };
        } else {
          throw new Error('Attachment must have either path or content');
        }
      });
    }

    const mailOptions = {
      from: config.EMAIL_ID,
      to: senderDetails.email,
      subject: senderDetails.subject,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Mail sent successfully');
  } catch (error) {
    console.error('❌ Error sending mail:', error);
  }
};
