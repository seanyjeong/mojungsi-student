# 학생용 Web (v0.2.6)

**배포**: `git push` → Vercel 자동
**API**: `jungsi.sean8320.dedyn.io`

---

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 대시보드 (메뉴) |
| `/search` | 대학 검색 + 환산점수 |
| `/my-universities` | 저장 대학 |
| `/practical` | 실기 기록 |
| `/mypage` | 내 정보 + 성적 |

---

## localStorage

| 키 | 설명 |
|----|------|
| `jungsi-scores` | 계산용 성적 |
| `jungsi-token` | JWT |

---

## 주요 컴포넌트

- `search/page.tsx` - 대학 검색 + 필터 + 여대 처리
- `my-universities/page.tsx` - 저장 대학 + 점수 계산
- `lib/api.ts` - API 호출 함수들
- `lib/storage.ts` - localStorage 관리

---

## 기술 스택

Next.js 15 / TypeScript / Tailwind / Radix UI / lucide-react
