import type { Metadata } from "next";
import { Geist, Geist_Mono, Mulish } from "next/font/google";
import "../app/globals.css"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAREWA – Fashion-Tech Platform",
  description:
    "Discover fashion trends, shop ready-to-wear apparel, explore fabrics and accessories, and interact with an AI stylist — built for event planners and designers.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
