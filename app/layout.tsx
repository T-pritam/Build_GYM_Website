import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk, EB_Garamond } from "next/font/google";
import "./globals.css";

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BUILD Fitness — Build Your Body. Track Your Progress.",
  description:
    "A premium gym with smart access, expert trainers, and an app that tracks everything. Book a free trial today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anybody.variable} ${hanken.variable} ${garamond.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
