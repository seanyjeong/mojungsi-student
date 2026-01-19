"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "k.kakaocdn.net",
            },
            {
                protocol: "http",
                hostname: "*.kakaocdn.net",
            },
        ],
    },
};
exports.default = nextConfig;
//# sourceMappingURL=next.config.js.map