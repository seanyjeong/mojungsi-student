// 카카오 공유 유틸리티

declare global {
  interface Window {
    Kakao: any;
  }
}

interface ShareScoreData {
  universityName: string;
  departmentName: string;
  region: string;
  totalScore: number;
  sunungScore: number;
  naesinScore?: number;
  practicalScore?: number;
  practicalRecords?: Array<{
    event: string;
    record: string;
    score?: number;
    deduction?: number;
  }>;
  totalDeduction?: number;
  ratios: {
    sunung: number;
    naesin: number;
    practical: number;
  };
  logoUrl?: string; // 학교 로고 URL (예: /univlogos/177.png)
}

// 카카오 SDK 초기화
export function initKakao() {
  if (typeof window === "undefined") return;

  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!kakaoKey) {
    console.error("NEXT_PUBLIC_KAKAO_JS_KEY is not set");
    return;
  }

  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoKey);
    console.log("Kakao SDK initialized");
  }
}

// 점수 공유
export function shareScore(data: ShareScoreData): boolean {
  if (typeof window === "undefined" || !window.Kakao) {
    alert("카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    initKakao();
  }

  // 점수 요약 (간결하게 - 카카오 description 글자 제한 있음)
  const scores = [];
  scores.push(`수능 ${data.sunungScore.toFixed(0)}`);
  if (data.naesinScore && data.naesinScore > 0) {
    scores.push(`내신 ${data.naesinScore.toFixed(0)}`);
  }
  if (data.practicalScore && data.practicalScore > 0) {
    const deduction = data.totalDeduction && data.totalDeduction > 0
      ? `(${data.totalDeduction}감)`
      : "";
    scores.push(`실기 ${data.practicalScore.toFixed(0)}${deduction}`);
  }

  // 설명: 총점 + 점수 요약만 (간결하게)
  const description = `총점 ${data.totalScore.toFixed(1)}점\n${scores.join(" / ")}`;

  // 앱 기본 아이콘 사용 (로고 이미지가 200x200 미만이라 카카오 요구사항 미충족)
  const imageUrl = "https://sjungsi.vercel.app/icon-512.png";

  try {
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${data.universityName} ${data.departmentName}`,
        description: description,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: "https://sjungsi.vercel.app",
          webUrl: "https://sjungsi.vercel.app",
        },
      },
      buttons: [
        {
          title: "나도 계산해보기",
          link: {
            mobileWebUrl: "https://sjungsi.vercel.app",
            webUrl: "https://sjungsi.vercel.app",
          },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("Kakao share error:", error);
    alert("공유에 실패했습니다. 다시 시도해주세요.");
    return false;
  }
}

// 카드형 공유 (이미지 포함)
export function shareScoreCard(data: ShareScoreData): boolean {
  if (typeof window === "undefined" || !window.Kakao) {
    alert("카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    initKakao();
  }

  // 실기 기록 요약
  let practicalSummary = "";
  if (data.practicalRecords && data.practicalRecords.length > 0) {
    const summaryItems = data.practicalRecords.map((r) => {
      if (r.deduction && r.deduction > 0) return `${r.event} ${r.deduction}감`;
      if (r.score !== undefined) return `${r.event} 만점`;
      return null;
    }).filter(Boolean);
    if (summaryItems.length > 0) {
      practicalSummary = `\n실기: ${summaryItems.join(", ")}`;
    }
  }

  const description = [
    `총점 ${data.totalScore.toFixed(1)}점`,
    `수능 ${data.sunungScore.toFixed(1)} / 내신 ${data.naesinScore?.toFixed(1) || "-"} / 실기 ${data.practicalScore?.toFixed(1) || "-"}`,
    practicalSummary,
  ].filter(Boolean).join("\n");

  try {
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${data.universityName} ${data.departmentName}`,
        description: description,
        imageUrl: "https://sjungsi.vercel.app/og-image.png", // OG 이미지 필요
        link: {
          mobileWebUrl: "https://sjungsi.vercel.app",
          webUrl: "https://sjungsi.vercel.app",
        },
      },
      buttons: [
        {
          title: "나도 계산해보기",
          link: {
            mobileWebUrl: "https://sjungsi.vercel.app",
            webUrl: "https://sjungsi.vercel.app",
          },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("Kakao share error:", error);
    alert("공유에 실패했습니다. 다시 시도해주세요.");
    return false;
  }
}
