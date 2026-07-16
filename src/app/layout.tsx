import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova AI OS — Holographic Intelligence",
  description:
    "Next-generation AI operating system with holographic interface, voice commands, smart home control, and real-time analytics.",
  keywords: ["AI", "holographic", "operating system", "dashboard", "smart home"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050510] text-[#e8eaff] font-sans">
        {/* Scanline overlay */}
        <div className="scanlines" />
        {children}
      </body>
    </html>
  );
}
