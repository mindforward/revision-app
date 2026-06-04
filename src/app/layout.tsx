import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import pkg from "../../package.json";
import "katex/dist/katex.min.css";
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
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased bg-gradient-to-b from-sky-50 to-white flex flex-col`}>
          {children}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          Revision App v{pkg.version}
        </footer>
      </body>
    </html>
  );
}
