import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

dotenv.config({
  path: path.join(backendRoot, '.env'),
  override: true,
});

const isSmtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter;

if (isSmtpConfigured) {
  console.log('[mail] SMTP configured using host:', process.env.SMTP_HOST);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  console.warn('[mail] SMTP environment variables are missing. Defaulting to Console Mailer...');
  // Fallback console mailer that mocks sending emails by printing to console
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('==================================================');
      console.log('[MOCK MAIL SENDER] EMAIL SENT SUCCESSFULLY');
      console.log('From:', mailOptions.from || 'Mini Coffee POS <noreply@minicoffeepos.com>');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:');
      console.log(mailOptions.text);
      console.log('==================================================');
      return {
        messageId: 'mock-message-id-' + Math.random().toString(36).substring(2),
        response: '250 Mock Message Accepted',
      };
    },
  };
}

export const mailSender = {
  sendEmail: async ({ to, subject, text, html }) => {
    let from = process.env.SMTP_FROM;
    if (!from && process.env.MAIL_FROM_EMAIL) {
      const name = process.env.MAIL_FROM_NAME || 'Mini Coffee POS';
      from = `"${name}" <${process.env.MAIL_FROM_EMAIL}>`;
    }
    if (!from) {
      from = '"Mini Coffee POS" <noreply@minicoffeepos.com>';
    }
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      return info;
    } catch (error) {
      console.error('[mail] Failed to send email:', error.message || error);
      throw error;
    }
  },
};
