"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // 파싱 실패 시 로그아웃 처리
        logout();
      }
    }
    setIsLoading(false);
  }, []);

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
