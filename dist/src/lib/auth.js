"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
exports.getToken = getToken;
exports.useRequireProfile = useRequireProfile;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const api_1 = require("./api");
function useAuth() {
    const [user, setUser] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const loadUserFromStorage = (0, react_1.useCallback)(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            }
            catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                setUser(null);
            }
        }
        else {
            setUser(null);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        loadUserFromStorage();
        setIsLoading(false);
        const handleStorageChange = (e) => {
            if (e.key === "user" || e.key === "accessToken") {
                loadUserFromStorage();
            }
        };
        const handleAuthChange = () => {
            loadUserFromStorage();
        };
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("auth-change", handleAuthChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("auth-change", handleAuthChange);
        };
    }, [loadUserFromStorage]);
    const login = async () => {
        try {
            const { url } = await (0, api_1.getKakaoLoginUrl)();
            window.location.href = url;
        }
        catch (error) {
            console.error("Failed to get login URL:", error);
            alert("로그인 URL을 가져오는데 실패했습니다");
        }
    };
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/";
    };
    const refreshUser = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token)
            return;
        try {
            const { user: userData } = await (0, api_1.getMe)(token);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
        catch {
            logout();
        }
    };
    return {
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
    };
}
function getToken() {
    if (typeof window === "undefined")
        return null;
    return localStorage.getItem("accessToken");
}
function useRequireProfile() {
    const router = (0, navigation_1.useRouter)();
    const [isProfileComplete, setIsProfileComplete] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const checkProfile = async () => {
            const token = getToken();
            if (!token) {
                setIsProfileComplete(false);
                return;
            }
            try {
                const profile = await (0, api_1.getProfile)(token);
                if (!profile.gender || !profile.grade) {
                    router.push("/mypage");
                    setIsProfileComplete(false);
                }
                else {
                    setIsProfileComplete(true);
                }
            }
            catch {
                setIsProfileComplete(false);
            }
        };
        checkProfile();
    }, [router]);
    return { isProfileComplete };
}
//# sourceMappingURL=auth.js.map