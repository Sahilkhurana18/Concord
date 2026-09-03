import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SessionProviderWrapper } from "../components/SessionProviderWrapper";
import { ThemeProviderWrapper } from "../components/ThemeProviderWrapper";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Concord — notes that never wait for a connection",
  description: "Offline-first, real-time collaborative notes with CRDT sync.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ThemeProviderWrapper>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
