import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlyWithPoints - Find the Best Award Flight Redemptions",
  description: "Discover the best award flight deals in real-time. AI-powered recommendations for optimal points transfers and maximum travel value.",
  keywords: ["award flights", "miles", "points", "travel rewards", "airline miles", "credit card points"],
  authors: [{ name: "FlyWithPoints" }],
  openGraph: {
    title: "FlyWithPoints - Find the Best Award Flight Redemptions",
    description: "Discover the best award flight deals in real-time. AI-powered recommendations for optimal points transfers.",
    type: "website",
    locale: "en_US",
    siteName: "FlyWithPoints",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlyWithPoints - Find the Best Award Flight Redemptions",
    description: "Discover the best award flight deals in real-time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
