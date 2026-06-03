import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST) {
    console.log('[mailer] SMTP not configured — skipping email to', to, subject);
    return { skipped: true };
  }
  return getTransporter().sendMail({
    from: process.env.ADMIN_EMAIL || 'noreply@aadmin.local',
    to,
    subject,
    html,
    text,
  });
};

export const applyTemplate = (template, vars = {}) =>
  Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, String(value ?? '')),
    template
  );
