import type { Metadata } from "next";
import { Pacifico, DM_Sans } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  weight: "400",
  variable: "--font-pacifico",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photobooth ✨",
  description: "Take 4 photos and create a photobooth-style image",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pacifico.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
