import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "广西大学毕业留念",
  description: "一页关于母校风光与毕业生记忆的留念。",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
