const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

const isConfigured = () =>
  Boolean(config.mail.host && config.mail.user && config.mail.password);

const getTransporter = () => {
  if (!isConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    });
  }
  return transporter;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildReplyEmail = ({
  recipientName,
  originalSubject,
  adminReply,
  portfolioName = 'Portfolio',
  contactEmail,
}) => {
  const subject = `Reply from Abshir Portfolio${originalSubject ? ` — ${originalSubject}` : ''}`;
  const greeting = recipientName ? `Hello ${escapeHtml(recipientName)},` : 'Hello,';
  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;">
        <h1 style="margin:0 0 8px;font-size:22px;color:#4f46e5;">${escapeHtml(portfolioName)}</h1>
        <p style="margin:0 0 20px;color:#64748b;">Reply to your message</p>
        <p style="margin:0 0 16px;">${greeting}</p>
        <p style="margin:0 0 16px;">Thank you for contacting us. Here is our reply to your message.</p>
        ${
          originalSubject
            ? `<p style="margin:0 0 8px;"><strong>Original subject:</strong> ${escapeHtml(originalSubject)}</p>`
            : ''
        }
        <div style="margin:16px 0;padding:16px;border-left:4px solid #4f46e5;background:#eef2ff;border-radius:8px;white-space:pre-wrap;">${escapeHtml(adminReply)}</div>
        <p style="margin:24px 0 0;color:#64748b;font-size:14px;">
          Best regards,<br/>
          ${escapeHtml(portfolioName)} Team
          ${contactEmail ? `<br/><a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>` : ''}
        </p>
      </div>
    </div>
  `;

  const text = [
    greeting.replace(/&[^;]+;/g, ''),
    '',
    'Thank you for contacting us. Here is our reply to your message.',
    originalSubject ? `Original subject: ${originalSubject}` : '',
    '',
    adminReply,
    '',
    `Best regards,`,
    `${portfolioName} Team`,
    contactEmail || '',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
};

/**
 * Sends admin reply notification email.
 * Returns { sent: boolean, skipped?: boolean, error?: string }
 */
const sendAdminReplyEmail = async ({
  to,
  recipientName,
  originalSubject,
  adminReply,
  portfolioName,
  contactEmail,
  attachmentPath,
  attachmentName,
}) => {
  const transport = getTransporter();
  if (!transport) {
    // eslint-disable-next-line no-console
    console.warn('[Mail] SMTP not configured — reply email skipped');
    return { sent: false, skipped: true };
  }

  const template = buildReplyEmail({
    recipientName,
    originalSubject,
    adminReply,
    portfolioName: portfolioName || 'Abshir Portfolio',
    contactEmail: contactEmail || config.mail.from,
  });

  try {
    const info = await transport.sendMail({
      from: config.mail.from || config.mail.user,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
      attachments: attachmentPath
        ? [{ filename: attachmentName || 'attachment', path: attachmentPath }]
        : undefined,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Mail] Failed to send reply email:', error.message);
    return { sent: false, error: error.message };
  }
};

const sendNewContactEmail = async ({
  to,
  adminName,
  senderName,
  senderEmail,
  subject,
  message,
}) => {
  const transport = getTransporter();
  if (!transport) {
    // eslint-disable-next-line no-console
    console.warn('[Mail] SMTP not configured — admin contact email skipped');
    return { sent: false, skipped: true };
  }

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc;color:#0f172a;">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;">
        <h1 style="margin:0 0 8px;font-size:20px;color:#4f46e5;">New Contact Message</h1>
        <p style="margin:0 0 16px;">Hello ${escapeHtml(adminName || 'Admin')},</p>
        <p style="margin:0 0 12px;">You received a new message on Abshir Portfolio.</p>
        <p style="margin:0 0 6px;"><strong>From:</strong> ${escapeHtml(senderName)} (${escapeHtml(senderEmail)})</p>
        <p style="margin:0 0 6px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <div style="margin-top:16px;padding:16px;border-left:4px solid #4f46e5;background:#eef2ff;border-radius:8px;white-space:pre-wrap;">${escapeHtml(message)}</div>
      </div>
    </div>
  `;

  try {
    const info = await transport.sendMail({
      from: config.mail.from || config.mail.user,
      to,
      subject: `New message: ${subject}`,
      text: `New message from ${senderName} <${senderEmail}>\nSubject: ${subject}\n\n${message}`,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Mail] Failed to send admin contact email:', error.message);
    return { sent: false, error: error.message };
  }
};

module.exports = {
  isConfigured,
  sendAdminReplyEmail,
  sendNewContactEmail,
  buildReplyEmail,
};
