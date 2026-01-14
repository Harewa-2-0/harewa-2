// lib/utils.ts

import { User } from "./models/User";

import crypto from "crypto";
import PDFDocument from "pdfkit";
import moment from "moment-timezone";
import { NextRequest } from "next/server";


export async function currentTime(date: number) {
  moment(date).tz("America/New_York").format();
};

export async function splitFullName(fullName: string): Promise<{ firstName: string; lastName: string }> {
  const names = fullName.trim().split(/\s+/);
  if (names.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (names.length === 1) {
    return { firstName: names[0], lastName: "" };
  }
  const firstName = names[0];
  const lastName = names.slice(1).join(" ");
  return {
    firstName,
    lastName,
  };
};

export async function generateUsername(joinedAt: Date, baseName?: string): Promise<string> {
  const timestamp = joinedAt.getTime().toString();
  // Using last 4 digits for a shorter, cleaner suffix
  const suffix = timestamp.slice(-4);

  // Extract first word of the name and normalize it, or fallback to 'user'
  const prefix = baseName ? baseName.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') : "user";
  const baseUsername = `${prefix}${suffix}`;

  let username = baseUsername;
  let count = 1;

  // Ensure the username is unique in the database
  while (await User.findOne({ username })) {
    username = `${baseUsername}${count}`;
    count += 1;
  }

  return username;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateTicketKey() {
  return crypto.randomBytes(20).toString("hex");
}

export async function getUserFromUuid(uuid: string) {
  const user = await User.findOne({
    uuid
  });
  return user;
}

export async function getUserFromUserid(userId: string) {
  const user = await User.findOne({
    _id: userId
  });
  return user;
}
export function generateKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 4; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

interface TicketOrder {
  ticketTitle: string;
  customerName: string;
  email: string;
  ticketId: string;
  qrCodePath?: string;
}

export const generateTicketPDF = (order: TicketOrder): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers: Uint8Array[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc
      .fontSize(18)
      .text(`Ticket for ${order.ticketTitle}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${order.customerName}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Ticket ID: ${order.ticketId}`);
    doc.moveDown().text("Show this ticket at the gate.", { align: "center" });

    if (order.qrCodePath) {
      doc.image(order.qrCodePath, {
        fit: [250, 250],
        align: "center",
        valign: "center",
      });
    }

    doc.end();
  });
};

// Utility function to generate 3 slug suggestions
export function generateSlugSuggestions(baseSlug: string) {
  const suffix = () => Math.random().toString(36).substring(2, 5); // random 3-letter suffix
  return [
    `${baseSlug}-${suffix()}`,
    `${baseSlug}-${suffix()}`,
    `${baseSlug}-${suffix()}`,
  ];
}

export function getClientIp(req: NextRequest) {
  // 1. Check for proxy-provided header
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim(); // client IP
  }

  // 2. Some proxies set this instead
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // 3. Local dev fallback
  // ::1 = IPv6 localhost, 127.0.0.1 = IPv4 localhost
  return "127.0.0.1";
}

