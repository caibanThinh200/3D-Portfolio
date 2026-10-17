import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Make Magic Happen — 3D Portfolio",
  description:
    "An immersive, luxury-tier 3D portfolio built with Next.js, React Three Fiber and Framer Motion.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen bg-black">{children}</body>
    </html>
  );
}
