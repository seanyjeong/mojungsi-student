"use client";

import { useState } from "react";
import Image from "next/image";

interface UniversityLogoProps {
  uId: number;
  name: string;
  size?: number;
}

// U_ID에서 로고용 기본 ID 추출
// 2026: 1-200, 2027: 1001-1200, 2028: 2001-2200
function getBaseUId(uId: number): number {
  if (uId >= 2000) return uId - 2000;
  if (uId >= 1000) return uId - 1000;
  return uId;
}

export default function UniversityLogo({ uId, name, size = 32 }: UniversityLogoProps) {
  const [imgError, setImgError] = useState(false);
  const baseUId = getBaseUId(uId);
  const initial = name.charAt(0);

  if (imgError) {
    // Fallback: 대학명 첫 글자
    return (
      <div
        className="flex items-center justify-center bg-blue-500 text-white font-bold rounded-full flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={`/univlogos/${baseUId}.png`}
      alt={`${name} 로고`}
      width={size}
      height={size}
      className="rounded-full flex-shrink-0 object-cover"
      onError={() => setImgError(true)}
    />
  );
}
