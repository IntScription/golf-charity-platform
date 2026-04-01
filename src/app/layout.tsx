import type { Metadata } from "next";
import "./globals.css";
import { appConfig } from "@/lib/utils/constants";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-white antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
