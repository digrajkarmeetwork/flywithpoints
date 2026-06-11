import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlyWithPoints - AI-Powered Award Flight Search",
  description: "Find the best award flights in real-time. AI-powered recommendations for optimal points transfers and maximum travel value across 23+ loyalty programs.",
  keywords: ["award flights", "miles", "points", "travel rewards", "airline miles", "credit card points", "award search"],
  authors: [{ name: "FlyWithPoints" }],
  openGraph: {
    title: "FlyWithPoints - AI-Powered Award Flight Search",
    description: "Find the best award flights in real-time. AI-powered search across 23+ loyalty programs.",
    type: "website",
    locale: "en_US",
    siteName: "FlyWithPoints",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlyWithPoints - AI-Powered Award Flight Search",
    description: "Find the best award flights in real-time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
