// lib/mailer.ts
import nodemailer from "nodemailer";
import { ICustomization } from "./models/Customization";

// Shared SMTP config (cPanel / Hostinger)
const smtpConfig = {
  host: process.env.SMTP_HOST, // e.g. mail.srv673978.hstgr.cloud
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // SSL for port 465
};

// Team emails (welcome, general comms)
const teamTransporter = nodemailer.createTransport({
  ...smtpConfig,
  auth: {
    user: process.env.TEAM_EMAIL_USER,
    pass: process.env.TEAM_EMAIL_PASS,
  },
});

// Notification emails (OTP, verification, reset, admin alerts)
export const notificationTransporter = nodemailer.createTransport({
  ...smtpConfig,
  auth: {
    user: process.env.NOTIFICATION_EMAIL_USER,
    pass: process.env.NOTIFICATION_EMAIL_PASS,
  },
});

/* -------------------------------------------------------------------------- */
/*                                EMAIL SENDERS                               */
/* -------------------------------------------------------------------------- */

export async function sendVerificationEmail(to: string, code: string) {
  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "🔐 Email Verification Code – Harewa",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1e40af;">Verify Your Email</h2>
        <p>You're almost there! Use the code below:</p>
        <div style="text-align:center; margin:20px 0;">
          <span style="padding:12px 24px; background:#1e40af; color:#fff; font-size:24px; letter-spacing:4px; border-radius:6px;">
            ${code}
          </span>
        </div>
        <p>This code expires shortly.</p>
        <p>– Harewa Team</p>
      </div>
    `,
  });
}

export async function sendAdminVerificationEmail(
  to: string,
  userMail: string,
  code: string
) {
  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "🔐 New Admin Registration – Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Admin Verification</h2>
        <p><strong>${userMail}</strong> has registered as an admin.</p>
        <h1 style="letter-spacing:4px;">${code}</h1>
        <p>Please share this code securely.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string) {
  await teamTransporter.sendMail({
    from: `"Harewa" <${process.env.TEAM_EMAIL_USER}>`,
    to,
    subject: "🎉 Welcome to Harewa",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to Harewa 🎉</h2>
        <p>We’re glad to have you on board.</p>
        <p>– Harewa Team</p>
      </div>
    `,
  });
}

export async function resendOtpEmail(to: string, otp: string) {
  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "Your OTP Verification Code",
    html: `
      <div>
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This code expires shortly.</p>
      </div>
    `,
  });
}

export async function sendResetEmail(to: string, url: string) {
  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "Password Reset",
    html: `
      <div>
        <h2>Reset Your Password</h2>
        <a href="${url}" style="padding:10px 16px; background:#1e40af; color:#fff; border-radius:6px; text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires shortly.</p>
      </div>
    `,
  });
}

export const sendFailureMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  return notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendCustomRequestMail = async ({
  to,
  subject,
  type,
  data,
}: {
  to: string;
  subject: string;
  type: "user" | "admin";
  data: ICustomization;
}) => {
  const html = generateCustomRequestHtml(to, type, data);
  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

/* -------------------------------------------------------------------------- */
/*                              HTML GENERATOR                                */
/* -------------------------------------------------------------------------- */

const generateCustomRequestHtml = (
  to: string,
  type: "user" | "admin",
  data: ICustomization
) => {
  const {
    outfit,
    outfitOption,
    fabricType,
    preferredColor,
    additionalNotes,
  } = data;

  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        ${type === "user"
      ? `<p>Hi ${to}, your request has been received.</p>`
      : `<h3>New Customization Request</h3>`
    }
        <ul>
          <li>Outfit: ${outfit}</li>
          <li>Option: ${outfitOption}</li>
          <li>Fit: ${fabricType}</li>
          <li>Color: ${preferredColor}</li>
          <li>Notes: ${additionalNotes}</li>
        </ul>
        <p>– Harewa Team</p>
      </body>
    </html>
  `;
};
