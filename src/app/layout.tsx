import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "溫習 App - Quiz Study",
  description: "互動溫習平台，支援多個題庫",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased bg-gradient-to-b from-sky-50 to-white`}>
        {children}
        <footer className="text-center text-gray-400 text-xs py-6">
          Revision App v1.0 &nbsp;·&nbsp; Developed by 如意小馬 © 2026
        </footer>
      </body>
    </html>
  );
}
