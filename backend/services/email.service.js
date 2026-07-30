const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email, resetLink) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('EMAIL_USER and EMAIL_PASS are not configured. Email will not be sent.');
      console.log(`[Email Mock] To: ${email} | Link: ${resetLink}`);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; }
          h2 { color: #0F172A; font-size: 24px; margin-top: 0; }
          p { color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
          .btn { display: inline-block; background-color: #2563EB; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
          .btn:hover { background-color: #1D4ED8; }
          .footer { margin-top: 32px; font-size: 14px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>Someone recently requested a password reset for your account. If this was you, please click the secure button below to set a new password. The link will expire in 15 minutes.</p>
          <a href="${resetLink}" class="btn" style="color: #FFFFFF;">Reset Password</a>
          <p class="footer">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Portfolio Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html,
      });
      console.info(`[EmailService] Password reset email sent successfully to ${email}`);
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${email}:`, error);
    }
  }
}

module.exports = new EmailService();
