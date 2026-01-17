# 정시 학생용 SaaS (mojungsi-student)

> **전체 시스템 명세**: `/home/sean/mprojects/JUNGSI_SYSTEM_SPEC.md` 참조

## 빠른 참조

| 항목 | 값 |
|------|-----|
| **경로** | `/home/sean/mprojects/web` |
| **로컬 포트** | 3002 |
| **배포** | Vercel (자동) |
| **API** | `jungsi.sean8320.dedyn.io` |
| **버전** | 0.2.5 |

---

## 배포

```bash
git add -A && git commit -m "메시지" && git push
# → Vercel 자동 배포
```

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 성적 입력 (홈) |
| `/search` | 대학 검색 + 환산점수 |
| `/my-universities` | 저장한 대학 |
| `/practical` | 실기 기록 관리 |
| `/mypage` | 내 정보 + 성적 관리 |
| `/result` | 결과 페이지 |
| `/university/[id]` | 대학 상세 |

---

## 주요 기능

### 성적 관리 (mypage)
- 시험 선택: 3월모의, 6월모의, 9월모의, 수능
- 계산에 사용할 시험 선택 가능
- 선택한 시험 성적이 localStorage에 저장되어 대학검색 계산에 사용

### 대학 검색 (search)
- 모집군별 필터 (가/나/다)
- 지역별 필터
- 텍스트 검색 (대학명/학과명)
- 상세보기: 과목별 반영비율 표시 (괄호 = 택1)

---

## localStorage 키

| 키 | 설명 |
|----|------|
| `jungsi-scores` | 계산에 사용할 성적 데이터 |
| `jungsi-calc-exam` | 계산에 사용할 시험 타입 |
| `jungsi-token` | JWT 토큰 |

---

## API 연동

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL; // jungsi.sean8320.dedyn.io

getUniversities(yearId)     // GET /universities
calculateAll(scores, year)  // POST /calculate/all
getProfile(token)           // GET /saas/profile
saveScore(token, ...)       // POST /saas/scores
```

---

## 기술 스택

- Next.js 15 + TypeScript
- Tailwind CSS
- Radix UI (Select, Tabs 등)
- react-hook-form + zod
- lucide-react (아이콘)

---

## 관련 프로젝트

| 프로젝트 | 경로 |
|----------|------|
| API | `/home/sean/mprojects/api` |
| 관리자 | `/home/sean/mprojects/admin` |
