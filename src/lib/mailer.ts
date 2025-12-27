// lib/mailer.ts
import nodemailer from "nodemailer";
import { ICustomization } from "./models/Customization";

/**
 * Helper function to create a transporter based on environment.
 * Supports Gmail (dev) and custom SMTP (production cPanel).
 */
function createTransporter(
  service: string,
  user: string,
  pass: string,
  host?: string,
  port?: number,
  secure?: boolean
) {
  if (service === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      tls: { rejectUnauthorized: false }, // allows dev Gmail to work behind proxies
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Notification transporter (used for user/admin verification emails)
 */
export const notificationTransporter = createTransporter(
  process.env.NOTIFICATION_SMTP_SERVICE!,
  process.env.NOTIFICATION_EMAIL_USER!,
  process.env.NOTIFICATION_EMAIL_PASS!,
  process.env.NOTIFICATION_EMAIL_HOST,
  process.env.NOTIFICATION_EMAIL_PORT ? Number(process.env.NOTIFICATION_EMAIL_PORT) : undefined,
  process.env.NOTIFICATION_EMAIL_SECURE === "true"
);

/**
 * Team transporter (used for welcome emails / internal messages)
 */
export const teamTransporter = createTransporter(
  process.env.TEAM_SMTP_SERVICE!,
  process.env.TEAM_EMAIL_USER!,
  process.env.TEAM_EMAIL_PASS!,
  process.env.TEAM_EMAIL_HOST,
  process.env.TEAM_EMAIL_PORT ? Number(process.env.TEAM_EMAIL_PORT) : undefined,
  process.env.TEAM_EMAIL_SECURE === "true"
);

/**
 * Send verification email to admin/user
 */
export async function sendVerificationEmail(to: string, code: string) {
  const mailOptions = {
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "🔐 Email Verification Code – Harewa",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #1e40af;">Verify Your Email</h2>
        <p>Hello,</p>
        <p>You're almost there! Use the verification code below to complete your admin login to <strong>Harewa</strong>:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 12px 24px; background-color: #1e40af; color: #fff; font-size: 24px; letter-spacing: 4px; border-radius: 6px;">
            ${code}
          </span>
        </div>
        <p>This code is valid for a limited time. If you didn’t initiate this request, you can safely ignore this email.</p>
        <p>Thanks,<br/>The Harewa Team</p>
        <hr style="margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `,
  };

  await notificationTransporter.sendMail(mailOptions);
}

/**
 * Send new admin registration verification email to super admin
 */
export async function sendAdminVerificationEmail(to: string, userMail: string, code: string) {
  const mailOptions = {
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "🔐 New Admin Registration – Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #1e40af;">New Admin Verification</h2>
        <p>Hello Super Admin,</p>
        <p>A new admin account has been created for <strong>${userMail}</strong>. To activate and verify this account, use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; padding: 12px 24px; background-color: #1e40af; color: #fff; font-size: 24px; letter-spacing: 4px; border-radius: 6px;">
            ${code}
          </span>
        </div>
        <p><strong>Next step:</strong> Share this code securely with the new admin to allow them to complete their signup process.</p>
        <p>If you did not expect this registration, please investigate immediately.</p>
        <p>Thanks,<br/>The Harewa System</p>
        <hr style="margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">This is an automated message for super admins. Please do not reply directly to this email.</p>
      </div>
    `,
  };

  await notificationTransporter.sendMail(mailOptions);
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(to: string) {
  const mailOptions = {
    from: `"Harewa" <${process.env.TEAM_EMAIL_USER}>`,
    to,
    subject: "🎉 Welcome to Harewa – Let's Get You Started!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1e40af;">Welcome to Harewa! 🎉</h2>
        <p>Hi there,</p>
        <p>We’re thrilled to have you join the Harewa community! Whether you’re here to explore amazing events or host unforgettable experiences, you're in great company.</p>
        <p>If you have any questions or need support, we’re just an email away.</p>
        <p>Thanks for joining us, and welcome once again!</p>
        <p>Cheers,<br/>The Harewa Team</p>
        <hr style="margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">You’re receiving this email because you signed up for Harewa. If you didn’t, please ignore this message.</p>
      </div>
    `,
  };

  await teamTransporter.sendMail(mailOptions);
}

/**
 * Send OTP email
 */
export async function resendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: sans-serif; padding: 1rem;">
        <h2>🔐 Your OTP Code</h2>
        <p>Use the following code to verify your admin login:</p>
        <h1 style="letter-spacing: 2px;">${otp}</h1>
        <p>This code will expire shortly. If you did not request this, please ignore.</p>
      </div>
    `,
  };

  await notificationTransporter.sendMail(mailOptions);
}

/**
 * Send password reset email
 */
export async function sendResetEmail(to: string, url: string) {
  const mailOptions = {
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "Password Reset",
    html: `
      <div style="font-family: sans-serif; padding: 1rem;">
        <h2>🔐 Reset your password</h2>
        <p>You have requested to change your password. Use the link below to reset it:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${url}" style="display:inline-block; padding: 6px 12px; background-color: #1e40af; color: #fff; font-size: 12px; letter-spacing: 4px; border-radius: 6px; text-decoration:none;">
            Reset Password
          </a>
        </div>
        <p>${url}</p>
        <p style="letter-spacing: 2px;">This link will expire shortly. If you did not request this, please ignore.</p>
      </div>
    `,
  };

  await notificationTransporter.sendMail(mailOptions);
}

/**
 * Send failure email (generic)
 */
export const sendFailureMail = async ({ to, subject, html }: { to: string; subject: string; html: string; }) => {
  try {
    const info = await notificationTransporter.sendMail({
      from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Failure mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending failure mail:", error);
    throw error;
  }
};

/**
 * Send custom request email
 */
export const sendCustomRequestMail = async ({ to, subject, type, data }: { to: string; subject: string; type: "user" | "admin"; data: ICustomization }) => {
  const html = generateCustomRequestHtml(to, type, data);

  const mailOptions = {
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await notificationTransporter.sendMail(mailOptions);
};

/**
 * Helper: Generate custom request email HTML
 */
const generateCustomRequestHtml = (to: string, type: "user" | "admin", data: ICustomization) => {
  const { outfit, outfitOption, fabricType, preferredColor, additionalNotes } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Customization Request</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { margin-bottom: 10px; }
        img { margin-top: 10px; border-radius: 8px; }
        ul li { margin: 5px 0; }
      </style>
    </head>
    <body>
      ${type === "user"
      ? `<h2>Hi ${to},</h2><p>Your customization request has been received!</p><p>We will get back to you shortly.</p>`
      : `<h2>New Customization Request</h2><p>A new customization request has been submitted with the following details:</p>`
    }
      <h3>Request Details</h3>
      <ul>
        <li><strong>Outfit:</strong> ${outfit}</li>
        <li><strong>Outfit Option:</strong> ${outfitOption}</li>
        <li><strong>Fit Type:</strong> ${fabricType}</li>
        <li><strong>Color:</strong> ${preferredColor}</li>
        <li><strong>Description:</strong> ${additionalNotes}</li>
      </ul>
      ${type === "user"
      ? '<p>Thank you for choosing Harewa for your customization needs!</p>'
      : '<p>Please check the admin panel for more details and to process this request.</p>'
    }
      <p style="margin-top: 30px;">– Harewa Team</p>
    </body>
    </html>
  `;
};
