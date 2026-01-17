# 학생용 Web (v0.3.2)

**배포**: `git push` → Vercel 자동
**API**: `jungsi.sean8320.dedyn.io`

---

## 페이지

| 경로 | 설명 | 로그인 |
|------|------|--------|
| `/` | 홈 (로그인/대시보드) | X |
| `/search` | 대학 검색 + 환산점수 | O |
| `/my-universities` | 저장 대학 | O |
| `/practical` | 실기 기록 | O |
| `/mypage` | 내 정보 + 성적 입력 | O |

---

## 인증 흐름

- 비로그인 → 각 페이지에서 "로그인 필요" 안내
- 로그아웃 → 자동으로 홈(/)으로 이동
- 성적 데이터 → **DB에서 가져옴** (localStorage 사용 안 함)

---

## 데이터 흐름

```
[mypage] 성적 입력 → DB 저장 (saas_saved_scores)
                          ↓
[search] DB에서 성적 조회 → calculateAll API → 환산점수 표시
                          ↓
[저장] 대학 저장 시 환산점수도 함께 DB 저장 (sunung_score)
                          ↓
[my-universities] DB에서 저장된 환산점수 표시
```

---

## 검색 페이지 기능 (v0.3.0+)

- **초성 바**: 스크롤 시 오른쪽에 ㄱㄴㄷ 표시, 클릭하면 해당 초성으로 이동
- **지역 다중선택**: 여러 지역 동시 필터 가능
- **초성별 그룹핑**: 대학 목록이 초성별로 구분됨

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `lib/auth.ts` | 인증 훅 (useAuth, getToken, logout→홈이동) |
| `lib/api.ts` | API 호출 함수들 |
| `search/page.tsx` | 대학 검색 + 초성바 + 다중지역필터 |
| `my-universities/page.tsx` | 저장 대학 + DB 환산점수 |
| `mypage/page.tsx` | 성적 입력/저장 (DB) |
| `components/bottom-nav.tsx` | 하단 네비게이션 (버전 표시) |

---

## 기술 스택

Next.js 15 / TypeScript / Tailwind / Radix UI / lucide-react
