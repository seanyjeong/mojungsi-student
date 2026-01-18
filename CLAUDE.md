# 학생용 Web (v0.4.18)

> **전체 프로젝트 명세**: `../docs/` 참조
> - `../docs/API.md` - 백엔드 API
> - `../docs/DATABASE.md` - DB 스키마
> - `../docs/FRONTEND.md` - 프론트엔드

**배포**: `git push` → Vercel 자동
**API**: `jungsi.sean8320.dedyn.io`

---

## 배포 시 필수 체크

### 버전업 필요한 파일 (3곳)
1. `package.json` - `"version": "x.x.x"`
2. `CLAUDE.md` - 맨 위 제목의 버전
3. `src/components/bottom-nav.tsx` - `APP_VERSION = "x.x.x"`

### 배포 명령어
```bash
git add -A && git commit -m "vX.X.X: 변경내용" && git push
```

---

## 앱 이름 변경 시 (현재: 정시계산기)

### 코드 수정 필요 (4곳)
| 파일 | 위치 | 현재 값 |
|------|------|---------|
| `src/app/layout.tsx` | title 메타태그 | "정시 환산점수 계산기" |
| `src/app/page.tsx` | 홈 타이틀 h1 | "정시 환산점수 계산기" |
| `src/components/header.tsx` | 헤더 텍스트 | "정시 환산점수 계산기" |
| `src/lib/kakao-share.ts` | 공유 메시지 | "📊 정시계산기" |

### 외부 설정 변경 필요
| 서비스 | 위치 | 변경 항목 |
|--------|------|----------|
| **카카오 개발자** | 앱 설정 > 앱 기본 정보 | 앱 이름 |
| **Vercel** | Project Settings | Project Name (선택) |

---

## 핵심 로직

### 학년별 입시연도
```
profile.grade에 따라 입시연도 결정:
- 3학년/N수 → 2027년 데이터
- 2학년 → 2028년 데이터

성적 조회: getScores(token) - 연도 무관
점수 계산: calculateAll(scores, userYear) - userYear는 학년으로 결정
```
**파일**: `search/page.tsx`

### 성적 저장 (v0.4.15 간소화)
```
saas_saved_scores 테이블:
- user_id: 사용자
- exam_type: 시험 종류 (3월모의고사, 6월모평, 9월모평, 수능 등)
- scores: JSON 성적 데이터
- year: 사용 안 함 (NULL)
```

### U_ID 연도 매핑 (중요!)
```
저장된 대학 U_ID와 연도별 U_ID가 다름!
- 2026: U_ID 177 (가톨릭관동대 스포츠레저학전공)
- 2027: U_ID 1177 (동일 대학)
- 2028: U_ID 2177 (예상)

실기 배점표 조회 시 대학명+학과명으로 해당 연도 U_ID 찾아서 조회
```
**파일**: API `saved-universities.service.js` (getPracticalScoreTable)

---

## 페이지

| 경로 | 설명 | 로그인 |
|------|------|--------|
| `/` | 홈 (로그인/대시보드) | X |
| `/search` | 대학 검색 + 환산점수 | O |
| `/my-universities` | 저장 대학 + 실기점수 계산 | O |
| `/practical` | 실기 기록 관리 + 성장 그래프 | O |
| `/mypage` | 내 정보 + 성적 입력 | O |

---

## 데이터 흐름

```
[mypage] 성적 입력 → DB 저장 (saas_saved_scores, 연도 없음)
                          ↓
[search] 학년→입시연도 결정 → DB에서 성적 조회 → calculateAll API → 환산점수 표시
                          ↓
[저장] 대학 저장 시 환산점수도 함께 DB 저장 (sunung_score)
                          ↓
[my-universities] DB에서 저장된 환산점수 + 실기점수 계산
```

---

## 저장대학 페이지

### 카드 UI
```
┌────────────────────────────────┐
│ 가톨릭관동대학교               │
│ 스포츠레저학전공  📍 강원      │
├────────────────────────────────┤
│ [수능] [내신] [실기]   968.3점 │
│  파랑   초록   보라      크게  │
└────────────────────────────────┘
```
- 수능: 파란색 카드
- 내신: 초록색 카드 (없으면 안 보임)
- 실기: 보라색 카드
- 총점: 오른쪽 끝 크게

### 모달 반영비율 카드
```
┌────────┬────────┬────────┐
│  수능  │  내신  │  실기  │
│  60%   │   -    │  40%   │
│  파랑  │  초록  │  보라  │
└────────┴────────┴────────┘
```
- 비율 0%인 항목은 자동 숨김

### 실기 계산
- 모달에서 종목별 기록 입력 → 점수/감수 실시간 계산
- 특수 대학 24개 지원 (practical-calc.ts)
- 감수 시스템: 만점=0감, 1등급 아래=1감...

---

## 실기 기록 관리 (/practical)

### 탭 구조
- **기록 관리**: 종목별 기록 추가/수정/삭제
- **성장 그래프**: 종목 선택 → Nivo Line 차트
- **종목 설정**: 커스텀 종목 추가, 방향 설정

### 기본 종목
| 종목명 | 방향 | 단위 |
|--------|------|------|
| 10m버튼, 10m콘, 20m버튼, 20m콘 | lower | 초 |
| 제멀 | higher | cm |
| 메던 | higher | m |
| 좌전굴 | higher | cm |
| 윗몸 | higher | 회 |

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `lib/auth.ts` | 인증 훅 (useAuth, getToken, logout) |
| `lib/api.ts` | API 호출 함수들 |
| `lib/practical-calc.ts` | 실기 점수 계산 + 특수 대학 공식 |
| `search/page.tsx` | 대학 검색 + 학년별 연도 분기 |
| `my-universities/page.tsx` | 저장 대학 + 실기계산 모달 |
| `practical/page.tsx` | 실기 기록 관리 + 그래프 |
| `mypage/page.tsx` | 성적 입력/저장 |

---

## 기술 스택

Next.js 15 / TypeScript / Tailwind / Radix UI / lucide-react / @nivo/line

---

## 주의사항

1. **DB 스키마 변경 금지** - 프론트에서 맞추기
2. **U_ID 연도 매핑** - 저장된 U_ID와 조회 연도가 다르면 대학명+학과명으로 매핑
3. **성적은 연도 없이 저장** - year 컬럼 사용 안 함, exam_type만으로 구분

---

## 변경 이력

### v0.4.15 (2026-01-18)
- 성적 연도 의존성 제거 (year 컬럼 미사용)
- 입시연도는 학년으로만 결정

### v0.4.13
- 저장대학 카드 점수 한 줄 레이아웃 (수내실 왼쪽 + 총점 오른쪽)

### v0.4.10~12
- 모달 반영비율 카드 UI (수능/내신/실기 색상 구분)
- 저장대학 카드 점수 UI 개선

### v0.4.9
- 학년별 입시연도 분기 (2학년→2028, 3학년/N수→2027)
