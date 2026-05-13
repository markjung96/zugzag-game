import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZUGZAG Game — 볼더링 랭크전",
  description: "클라이밍 크루용 실시간 볼더링 랭크전",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-canvas text-text-primary font-kr">
        {children}
      </body>
    </html>
  );
}
