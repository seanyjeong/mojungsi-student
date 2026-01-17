"use client";

import { useState, useEffect, useCallback } from "react";
import { getKakaoLoginUrl, getMe } from "./api";

export interface User {
  id: number;
  nickname: string;
  email: string | null;
  profileImage: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // 초기 로드
    loadUserFromStorage();
    setIsLoading(false);

    // storage 이벤트 리스닝 (다른 탭에서 변경 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "accessToken") {
        loadUserFromStorage();
      }
    };

    // 커스텀 이벤트 리스닝 (같은 탭 내 다른 컴포넌트에서 변경 시)
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
      const { url } = await getKakaoLoginUrl();
      window.location.href = url;
    } catch (error) {
      console.error("Failed to get login URL:", error);
      alert("로그인 URL을 가져오는데 실패했습니다");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    // 홈으로 이동
    window.location.href = "/";
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const { user: userData } = await getMe(token);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
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

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}
