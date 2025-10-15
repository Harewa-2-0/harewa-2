import type { Metadata } from "next";
import { Geist, Geist_Mono, Mulish } from "next/font/google";
import "../app/globals.css";
import AuthBootstrap from "./auth-bootstrap";
import { CartHydrationWithErrorBoundary } from "@/components/Public_C/cart/cart-hydration";
import ToastContainer from '@/components/ui/toast-container';
import { ToastProvider } from '@/contexts/toast-context';
//import AuthDebug from "@/components/Public_C/auth-debug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "HAREWA – Fashion-Tech Platform",
  description:
    "Discover fashion trends, shop ready-to-wear apparel, explore fabrics and accessories, and interact with an AI stylist — built for event planners and designers.",
  keywords: [
    "fashion",
    "fashion technology",
    "ready-to-wear",
    "fabric marketplace",
    "AI stylist",
    "fashion trends",
    "event planning",
    "fashion design",
    "African fashion",
    "fashion accessories"
  ],
  authors: [{ name: "HAREWA Team" }],
  creator: "HAREWA",
  publisher: "HAREWA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://harewa-2.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://harewa-2.vercel.app",
    title: "HAREWA – Where Innovation Meets Fashion",
    description:
      "Your premier destination where cutting-edge technology meets the vibrant world of fashion. Discover trends, shop ready-to-wear, explore fabrics, and get AI-powered style recommendations.",
    siteName: "HAREWA",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "HAREWA Fashion-Tech Platform Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HAREWA – Where Innovation Meets Fashion",
    description:
      "Your premier destination where cutting-edge technology meets the vibrant world of fashion. Discover trends, shop ready-to-wear, explore fabrics, and get AI-powered style recommendations.",
    images: ["/logo.webp"],
    creator: "@harewa",
    site: "@harewa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable}`}
    >
      <body data-gramm="false" className="antialiased font-sans ">
        <ToastProvider>
          <AuthBootstrap />
          <CartHydrationWithErrorBoundary />
          {/*<AuthDebug /> Debug Card */}
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}