import type { Metadata } from "next";
import { Lato } from "next/font/google";
import React from "react";
import "./globals.css";

const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Gradient Science Club",
  description: "Koło naukowe Gradient - Science Club focused on innovative research and education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lato.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
} 