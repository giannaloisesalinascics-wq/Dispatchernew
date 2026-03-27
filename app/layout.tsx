import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hopecard Auth",
  description: "Login and signup page built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}