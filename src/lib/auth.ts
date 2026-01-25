"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getKakaoLoginUrl, getMe, getProfile } from "./api";
import { showToast } from "@/components/toast";

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
      showToast("error", "현재 서버 점검 중입니다. 잠시 후 다시 시도해주세요.");
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

/**
 * 로그인 필수 페이지용 훅
 * 로그인 안 되어 있으면 자동으로 카카오 로그인으로 리다이렉트
 */
export function useRequireAuth() {
  const { isLoggedIn, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const redirectToLogin = async () => {
      if (!isLoading && !isLoggedIn && !isRedirecting) {
        setIsRedirecting(true);
        try {
          const { url } = await getKakaoLoginUrl();
          window.location.href = url;
        } catch (error) {
          console.error("Failed to get login URL:", error);
          // 로그인 URL 가져오기 실패 시 홈으로
          window.location.href = "/";
        }
      }
    };

    redirectToLogin();
  }, [isLoading, isLoggedIn, isRedirecting]);

  return { isLoggedIn, isLoading, isRedirecting };
}

/**
 * 프로필 필수 정보(성별, 학년) 체크 훅
 * 로그인 후 성별/학년이 없으면 mypage로 리다이렉트
 */
export function useRequireProfile() {
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      const token = getToken();
      if (!token) {
        setIsProfileComplete(false);
        return;
      }

      try {
        const profile = await getProfile(token);
        if (!profile.gender || !profile.grade) {
          // 프로필 미완성 - mypage로 리다이렉트
          router.push("/mypage");
          setIsProfileComplete(false);
        } else {
          setIsProfileComplete(true);
        }
      } catch {
        setIsProfileComplete(false);
      }
    };

    checkProfile();
  }, [router]);

  return { isProfileComplete };
}
