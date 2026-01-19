"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const bottom_nav_1 = require("@/components/bottom-nav");
const header_1 = require("@/components/header");
const geistSans = (0, google_1.Geist)({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = (0, google_1.Geist_Mono)({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
exports.metadata = {
    title: "정시 환산점수 계산기",
    description: "체대입시 수능 환산점수 계산 서비스",
};
function RootLayout({ children, }) {
    return (<html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
          <header_1.Header />
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        </div>
        <bottom_nav_1.BottomNav />
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map