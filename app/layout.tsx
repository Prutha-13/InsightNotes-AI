import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "InsightNotes AI",
  description: "AI-powered intelligent note workspace"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
