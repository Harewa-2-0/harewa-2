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
/*                           EMAIL WRAPPER TEMPLATE                           */
/* -------------------------------------------------------------------------- */

const wrapEmailHtml = (content: string, title?: string) => {
  // IMPORTANT: For emails to display the logo correctly, NEXT_PUBLIC_BASE_URL must be set to your production domain
  // Example: NEXT_PUBLIC_BASE_URL=https://harewa.com
  // The logo must be publicly accessible at: https://yourdomain.com/logoblackBG.png
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const logoUrl = `${siteUrl}/logoblackBG.png`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      ${title ? `<title>${title}</title>` : ''}
      <style>
        body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 24px; text-align: center; }
        .header img { height: 60px; width: auto; display: block; margin: 0 auto; }
        .content { padding: 40px 32px; color: #1f2937; line-height: 1.7; }
        .footer { background-color: #f9fafb; padding: 24px 32px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
        .footer a { color: #D4AF37; text-decoration: none; }
        .button { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #000000 !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3); }
        .code-box { background: linear-gradient(135deg, #fffbf0 0%, #fef8e6 100%); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #D4AF37; font-family: 'Courier New', monospace; }
        .info-box { background-color: #f9fafb; border-left: 4px solid #D4AF37; padding: 20px; border-radius: 6px; margin: 24px 0; }
        .warning-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 6px; margin: 24px 0; }
        .success-box { background-color: #fffbf0; border-left: 4px solid #D4AF37; padding: 20px; border-radius: 6px; margin: 24px 0; }
        h1 { color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; }
        h2 { color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 12px 0; }
        p { margin: 0 0 16px 0; color: #374151; }
        ul { padding-left: 24px; margin: 16px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        .divider { height: 1px; background-color: #e5e7eb; margin: 32px 0; }
        @media only screen and (max-width: 600px) {
          .content { padding: 32px 20px !important; }
          .header { padding: 24px 20px !important; }
          .footer { padding: 20px !important; }
          h1 { font-size: 24px !important; }
          .code { font-size: 28px !important; letter-spacing: 6px !important; }
        }
      </style>
    </head>
    <body>
      <div style="background-color: #f4f6f9; padding: 40px 20px;">
        <div class="email-container">
          <div class="header">
            <img src="${logoUrl}" alt="Harewa" />
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;">
              <strong>Harewa</strong> - Your Fashion Companion
            </p>
            <p style="margin: 0 0 12px 0;">
              Need help? Contact us at <a href="mailto:admin@harewa.com">admin@harewa.com</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} Harewa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/* -------------------------------------------------------------------------- */
/*                                EMAIL SENDERS                               */
/* -------------------------------------------------------------------------- */

export async function sendVerificationEmail(to: string, code: string) {
  const content = `
    <h1>Verify Your Email Address</h1>
    <p>Welcome to <strong>Harewa</strong>! We're excited to have you join our fashion community.</p>
    <p>To complete your registration and secure your account, please use the verification code below:</p>
    
    <div class="code-box">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">YOUR VERIFICATION CODE</p>
      <div class="code">${code}</div>
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #9ca3af;">This code expires in 10 minutes</p>
    </div>
    
    <div class="info-box">
      <p style="margin: 0; font-size: 14px;"><strong>Security Tip:</strong> Never share this code with anyone. Harewa will never ask for your verification code via phone or email.</p>
    </div>
    
    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
    </p>
    
    <div class="divider"></div>
    
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Best regards,<br>
      <strong style="color: #1f2937;">The Harewa Team</strong>
    </p>
  `;

  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "🔐 Verify Your Email - Harewa",
    html: wrapEmailHtml(content, "Verify Your Email - Harewa"),
  });
}

export async function sendAdminVerificationEmail(
  to: string,
  userMail: string,
  code: string
) {
  const content = `
    <h1>🔐 New Admin Registration</h1>
    <p>A new administrator account has been created and requires verification.</p>
    
    <div class="info-box">
      <p style="margin: 0 0 8px 0;"><strong>Registrant Email:</strong></p>
      <p style="margin: 0; font-size: 16px; color: #D4AF37; font-weight: 600;">${userMail}</p>
    </div>
    
    <p>Please share the following verification code with the new administrator to complete their registration:</p>
    
    <div class="code-box">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">ADMIN VERIFICATION CODE</p>
      <div class="code">${code}</div>
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #9ca3af;">This code expires in 15 minutes</p>
    </div>
    
    <div class="warning-box">
      <p style="margin: 0; font-size: 14px;"><strong>⚠️ Important:</strong> Only share this code through secure channels. Verify the identity of the person requesting admin access before providing this code.</p>
    </div>
    
    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      If this registration was not authorized, please contact the security team immediately.
    </p>
    
    <div class="divider"></div>
    
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Best regards,<br>
      <strong style="color: #1f2937;">Harewa Security Team</strong>
    </p>
  `;

  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "🔐 New Admin Registration - Verification Required",
    html: wrapEmailHtml(content, "Admin Verification - Harewa"),
  });
}

export async function sendWelcomeEmail(to: string) {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const content = `
    <h1>Welcome to Harewa! 🎉</h1>
    <p>We're absolutely thrilled to have you join our vibrant fashion community!</p>
    
    <p>Harewa is your ultimate destination for discovering the latest fashion trends, exploring unique styles, and creating custom outfits that express your personality.</p>
    
    <div class="success-box">
      <h2 style="margin: 0 0 12px 0; font-size: 18px;">What You Can Do:</h2>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>Explore Trends:</strong> Stay updated with the latest fashion insights</li>
        <li><strong>Shop Ready-to-Wear:</strong> Browse our curated collection</li>
        <li><strong>AI Style Generator:</strong> Get personalized fashion recommendations</li>
        <li><strong>Custom Designs:</strong> Create unique pieces tailored to you</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${siteUrl}" class="button">Start Exploring</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Need help getting started? Our support team is always here to assist you at <a href="mailto:admin@harewa.com" style="color: #D4AF37; text-decoration: none;">admin@harewa.com</a>
    </p>
    
    <div class="divider"></div>
    
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Warm regards,<br>
      <strong style="color: #1f2937;">The Harewa Team</strong>
    </p>
  `;

  await teamTransporter.sendMail({
    from: `"Harewa" <${process.env.TEAM_EMAIL_USER}>`,
    to,
    subject: "🎉 Welcome to Harewa - Let's Get Started!",
    html: wrapEmailHtml(content, "Welcome to Harewa"),
  });
}

export async function resendOtpEmail(to: string, otp: string) {
  const content = `
    <h1>Your Verification Code</h1>
    <p>You requested a new verification code for your Harewa account.</p>
    
    <div class="code-box">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">ONE-TIME PASSWORD (OTP)</p>
      <div class="code">${otp}</div>
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #9ca3af;">This code expires in 10 minutes</p>
    </div>
    
    <div class="info-box">
      <p style="margin: 0; font-size: 14px;"><strong>Security Note:</strong> This is a one-time code. Do not share it with anyone, including Harewa staff.</p>
    </div>
    
    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      If you didn't request this code, please secure your account immediately by changing your password.
    </p>
    
    <div class="divider"></div>
    
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Best regards,<br>
      <strong style="color: #1f2937;">The Harewa Team</strong>
    </p>
  `;

  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "Your OTP Verification Code - Harewa",
    html: wrapEmailHtml(content, "OTP Verification - Harewa"),
  });
}

export async function sendResetEmail(to: string, url: string) {
  const content = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset the password for your Harewa account.</p>
    
    <p>Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" class="button">Reset My Password</a>
    </div>
    
    <div class="info-box">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Alternative Link:</strong></p>
      <p style="margin: 0; font-size: 13px; word-break: break-all; color: #6b7280;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${url}" style="color: #D4AF37; text-decoration: none;">${url}</a>
      </p>
    </div>
    
    <div class="warning-box">
      <p style="margin: 0; font-size: 14px;"><strong>⚠️ Didn't request this?</strong> If you didn't ask to reset your password, please ignore this email. Your account remains secure.</p>
    </div>
    
    <div class="divider"></div>
    
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Best regards,<br>
      <strong style="color: #1f2937;">The Harewa Team</strong>
    </p>
  `;

  await notificationTransporter.sendMail({
    from: `"Harewa" <${process.env.NOTIFICATION_EMAIL_USER}>`,
    to,
    subject: "Reset Your Password - Harewa",
    html: wrapEmailHtml(content, "Password Reset - Harewa"),
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
    html: wrapEmailHtml(html),
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
    html: wrapEmailHtml(html),
  });
};

/* -------------------------------------------------------------------------- */
/*                              HTML GENERATORS                               */
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

  if (type === "user") {
    return `
      <h1>Customization Request Received! ✨</h1>
      <p>Thank you for submitting your custom design request. We're excited to bring your vision to life!</p>
      
      <div class="success-box">
        <h2 style="margin: 0 0 16px 0; font-size: 18px;">Your Request Details:</h2>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Outfit Type:</strong> ${outfit}</li>
          <li><strong>Style Option:</strong> ${outfitOption}</li>
          <li><strong>Fabric Type:</strong> ${fabricType}</li>
          <li><strong>Preferred Color:</strong> ${preferredColor}</li>
          ${additionalNotes ? `<li><strong>Additional Notes:</strong> ${additionalNotes}</li>` : ''}
        </ul>
      </div>
      
      <p>Our design team will review your request and get back to you within <strong>24-48 hours</strong> with a quote and timeline.</p>
      
      <div class="info-box">
        <p style="margin: 0; font-size: 14px;">
          <strong>What's Next?</strong><br>
          We'll send you design mockups and pricing details soon. You'll have the opportunity to request adjustments before we begin production.
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        Questions? Reply to this email or contact us at <a href="mailto:admin@harewa.com" style="color: #D4AF37; text-decoration: none;">admin@harewa.com</a>
      </p>
      
      <div class="divider"></div>
      
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Best regards,<br>
        <strong style="color: #1f2937;">Harewa Design Team</strong>
      </p>
    `;
  } else {
    return `
      <h1>🎨 New Customization Request</h1>
      <p>A customer has submitted a new custom design request that requires your attention.</p>
      
      <div class="info-box">
        <p style="margin: 0 0 8px 0;"><strong>Customer Email:</strong></p>
        <p style="margin: 0; font-size: 16px; color: #D4AF37; font-weight: 600;">${to}</p>
      </div>
      
      <div class="success-box">
        <h2 style="margin: 0 0 16px 0; font-size: 18px;">Request Specifications:</h2>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Outfit Type:</strong> ${outfit}</li>
          <li><strong>Style Option:</strong> ${outfitOption}</li>
          <li><strong>Fabric Type:</strong> ${fabricType}</li>
          <li><strong>Preferred Color:</strong> ${preferredColor}</li>
          ${additionalNotes ? `<li><strong>Additional Notes:</strong> ${additionalNotes}</li>` : ''}
        </ul>
      </div>
      
      <p><strong>Action Required:</strong> Please review this request and respond to the customer within 24-48 hours with a quote and estimated timeline.</p>
      
      <div class="divider"></div>
      
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        <strong style="color: #1f2937;">Harewa Admin System</strong>
      </p>
    `;
  }
};
