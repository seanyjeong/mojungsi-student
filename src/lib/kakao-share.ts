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

// 점수 공유 (텍스트형 - 글자수 제한 적음, 링크 클릭 가능)
export function shareScore(data: ShareScoreData): boolean {
  if (typeof window === "undefined" || !window.Kakao) {
    alert("카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    initKakao();
  }

  // 소숫점 포맷 (.0이면 정수로)
  const formatScore = (n: number) => n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);

  // 점수 한 줄 요약
  const scoreParts = [];
  scoreParts.push(`수능 ${formatScore(data.sunungScore)}점`);
  if (data.naesinScore && data.naesinScore > 0) {
    scoreParts.push(`내신 ${formatScore(data.naesinScore)}점`);
  }
  if (data.practicalScore && data.practicalScore > 0) {
    const totalDeduction = data.totalDeduction && data.totalDeduction > 0
      ? `(${data.totalDeduction}감)`
      : "";
    scoreParts.push(`실기 ${formatScore(data.practicalScore)}점${totalDeduction}`);
  }

  // 실기 종목별 기록 (각 종목 한 줄씩)
  let practicalLines = "";
  if (data.practicalRecords && data.practicalRecords.length > 0) {
    const lines = data.practicalRecords.map((r) => {
      const deductionText = r.deduction && r.deduction > 0
        ? `(${r.deduction}감)`
        : (r.score !== undefined ? "(만점)" : "");
      return `${r.event} ${r.record} ${deductionText}`.trim();
    }).filter(Boolean);
    if (lines.length > 0) {
      practicalLines = `\n${lines.join("\n")}`;
    }
  }

  // 텍스트 메시지 구성
  const text = `📊 정시계산기

${data.universityName}
${data.departmentName}

✓ 총점 ${formatScore(data.totalScore)}점
${scoreParts.join(" · ")}${practicalLines}`;

  try {
    window.Kakao.Share.sendDefault({
      objectType: "text",
      text: text,
      link: {
        mobileWebUrl: "https://sjungsi.vercel.app",
        webUrl: "https://sjungsi.vercel.app",
      },
      buttonTitle: "나도 계산해보기",
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
