"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottomNav = BottomNav;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const APP_VERSION = "0.3.7";
function BottomNav() {
    const pathname = (0, navigation_1.usePathname)();
    const navItems = [
        { href: "/", label: "홈", icon: lucide_react_1.Home },
        { href: "/search", label: "대학검색", icon: lucide_react_1.Search },
        { href: "/my-universities", label: "저장대학", icon: lucide_react_1.Heart },
        { href: "/practical", label: "실기관리", icon: lucide_react_1.Dumbbell },
        { href: "/mypage", label: "내정보", icon: lucide_react_1.User },
    ];
    return (<nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around relative">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (<link_1.default key={item.href} href={item.href} className={(0, utils_1.cn)("flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-h-[48px] min-w-[48px] justify-center", isActive
                    ? "text-primary"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100")}>
              <Icon className="h-5 w-5"/>
              <span className="text-xs font-medium">{item.label}</span>
            </link_1.default>);
        })}
        
        <span className="absolute right-2 top-1 text-[10px] text-zinc-400 dark:text-zinc-500">
          v{APP_VERSION}
        </span>
      </div>
    </nav>);
}
//# sourceMappingURL=bottom-nav.js.map