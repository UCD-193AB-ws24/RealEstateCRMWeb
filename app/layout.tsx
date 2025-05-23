"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
const geist = Inter({ subsets: ["latin"], variable: "--font-geist" });
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <html lang="en" className={geist.variable}>
        <body>
          <Navbar />
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    </SessionProvider>
  );
}
