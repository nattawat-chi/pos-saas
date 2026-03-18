import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: " Coffee POS",
  description: "ระบบจัดการร้านกาแฟและเครื่องดื่ม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"bg-zinc-50 antialiased"}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
