import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAN India Price Projection Engine",
  description:
    "PAN India residential primary-market asking price projection product.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}