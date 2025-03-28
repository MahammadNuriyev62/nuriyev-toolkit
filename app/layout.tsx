import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuriyev Toolkit - RLHF Labeling",
  description: "A tool for labeling RLHF data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
