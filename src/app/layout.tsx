import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "정시 환산점수 계산기",
  description: "체대입시 수능 환산점수 계산 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
          <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                정시 환산점수 계산기
              </h1>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
