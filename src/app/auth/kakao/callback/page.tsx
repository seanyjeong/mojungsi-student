"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { kakaoCallback } from "@/lib/api";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg("카카오 로그인이 취소되었습니다");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("인가 코드가 없습니다");
      return;
    }

    // 카카오 콜백 처리
    kakaoCallback(code)
      .then((result) => {
        // 토큰과 사용자 정보 저장
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("user", JSON.stringify(result.user));

        setStatus("success");

        // 1초 후 메인 페이지로 이동
        setTimeout(() => {
          router.push("/");
        }, 1000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message || "로그인에 실패했습니다");
      });
  }, [searchParams, router]);

  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-zinc-200 max-w-sm w-full mx-4">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-600">로그인 처리 중...</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-zinc-800 font-medium">로그인 성공!</p>
          <p className="text-zinc-500 text-sm mt-1">잠시 후 이동합니다...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-zinc-800 font-medium">로그인 실패</p>
          <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm"
          >
            돌아가기
          </button>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-zinc-200 max-w-sm w-full mx-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-zinc-600">로딩 중...</p>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Suspense fallback={<LoadingFallback />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
