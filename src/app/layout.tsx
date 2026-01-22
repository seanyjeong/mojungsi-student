import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Header } from "@/components/header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHEJUMP - 체대입시 정시 계산기",
  description: "체대입시 수능 환산점수 계산 서비스",
  manifest: "/manifest.json",
  themeColor: "#0e4375",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CHEJUMP",
  },
  icons: {
    icon: [
      { url: "/icons/icon_192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon_512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon_152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon_192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/20">
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        </div>
        <BottomNav />
        <ServiceWorkerRegister />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
