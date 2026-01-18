# 학생용 Web (v0.4.3)

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

### 버전 규칙
- `0.X.0` - 큰 기능 추가
- `0.x.X` - 버그 수정, 작은 개선

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
[my-universities] DB에서 저장된 환산점수 + 실기점수 계산
```

---

## 검색 페이지 기능 (v0.3.0+)

- **초성 바**: 스크롤 시 오른쪽에 ㄱㄴㄷ 표시, 클릭하면 해당 초성으로 이동
- **지역 다중선택**: 여러 지역 동시 필터 가능
- **초성별 그룹핑**: 대학 목록이 초성별로 구분됨

---

## 저장대학 페이지 (v0.3.7)

- **모집군 탭**: 가군/나군/다군 분리, 탭별 개수 표시
- **카드 UI**: 총점 크게, 수능/내신/실기 작게
- **실기 계산**: 모달에서 종목별 기록 입력 → 점수/감수 실시간 계산
- **특수 대학**: 24개 대학 특수 공식 지원 (practical-calc.ts)

---

## 실기 점수 계산

### 핵심 파일
| 파일 | 설명 |
|------|------|
| `lib/practical-calc.ts` | 실기 계산 로직 + 24개 특수 대학 |
| `my-universities/page.tsx` | 모달에서 기록 입력 UI |

### 특수 계산 대학 (U_ID)
- 2, 3, 13, 16, 17, 19: 개별 공식
- 69, 70, 71: 합계 기반
- 99, 146, 147: 상위 N개 종목
- 121: PASS 개수 기반
- 151~160, 175, 184, 186, 189, 194, 197, 199: 각각 개별 공식

### 감수 시스템
- 만점 = 0감, 1등급 아래 = 1감, 2등급 아래 = 2감...
- UI에서 "만점" 또는 "N감" 표시

---

## 실기 기록 관리 (v0.4.0)

### 탭 구조
- **기록 관리**: 종목별 기록 추가/수정/삭제
- **성장 그래프**: 종목 선택 → 시간에 따른 성장 추적 (Nivo Line)
- **종목 설정**: 커스텀 종목 추가/삭제, 방향(낮을수록/높을수록 좋음) 설정

### 기본 종목
| 종목명 | 방향 | 단위 |
|--------|------|------|
| 10m버튼, 10m콘, 20m버튼, 20m콘 | lower | 초 |
| 제멀 | higher | cm |
| 메던 | higher | m |
| 좌전굴 | higher | cm |
| 윗몸 | higher | 회 |

### 주요 파일
| 파일 | 설명 |
|------|------|
| `practical/page.tsx` | 메인 페이지 (탭 구조) |
| `practical/components/RecordTab.tsx` | 기록 관리 탭 |
| `practical/components/GrowthChart.tsx` | 성장 그래프 (Nivo) |
| `practical/components/EventSettings.tsx` | 종목 설정 |

### API 엔드포인트
| 엔드포인트 | 설명 |
|-----------|------|
| `GET /saas/practical/event-types` | 종목 목록 (없으면 기본 종목 자동 생성) |
| `POST /saas/practical/event-types` | 종목 추가 |
| `GET /saas/practical/history/:eventName` | 그래프용 히스토리 + 통계 |

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `lib/auth.ts` | 인증 훅 (useAuth, getToken, logout→홈이동) |
| `lib/api.ts` | API 호출 함수들 |
| `lib/practical-calc.ts` | 실기 점수 계산 + 특수 대학 공식 |
| `search/page.tsx` | 대학 검색 + 초성바 + 다중지역필터 |
| `my-universities/page.tsx` | 저장 대학 + 탭 + 실기계산 모달 |
| `practical/page.tsx` | 실기 기록 관리 + 그래프 |
| `mypage/page.tsx` | 성적 입력/저장 (DB) |
| `components/bottom-nav.tsx` | 하단 네비게이션 (버전 표시) |

---

## 기술 스택

Next.js 15 / TypeScript / Tailwind / Radix UI / lucide-react / **@nivo/line**

---

## 다음 작업

- [x] `/practical` 페이지 - 실기 기록 관리 완료 (v0.4.0)
