# 학생용 Web (v0.4.23)

> **전체 프로젝트 명세**: `../docs/` 참조
> - `../docs/API.md` - 백엔드 API
> - `../docs/DATABASE.md` - DB 스키마
> - `../docs/FRONTEND.md` - 프론트엔드

**배포**: `git push` → Vercel 자동
**API**: `jungsi.sean8320.dedyn.io`

---

## 내일 할 일 (2026-01-20)

### 1. 실기 종목 단위 확인 (필수)
사용자가 "ㄱㄱ" 하면 **종목 하나씩 물어보기**:
- 90개+ 종목 각각 단위 확인 (초/cm/m/회/점)
- 확인된 종목은 아래 TODO 섹션 목록에서 체크

### 2. DB 테이블 생성
```sql
CREATE TABLE practical_event_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(50) NOT NULL UNIQUE,
  unit VARCHAR(10) NOT NULL,
  direction ENUM('lower', 'higher') DEFAULT 'higher'
);
```

### 3. 단위 데이터 INSERT
확인된 종목들 INSERT 문 작성 후 실행

### 4. API 수정
- `api/src/saas/universities/saved-universities.service.ts`
- 실기 배점표 조회 시 unit 포함하여 반환

### 5. 프론트 수정
- `src/lib/kakao-share.ts` - 공유 메시지에 단위 표시 (예: 5.21초)

---

## 배포 시 필수 체크

### 버전업 필요한 파일 (3곳)
1. `package.json` - `"version": "x.x.x"`
2. `CLAUDE.md` - 맨 위 제목의 버전
3. `src/components/bottom-nav.tsx` - `APP_VERSION = "x.x.x"`

### 문서 업데이트 필수 (4곳)
**코드 수정/기능 추가 시 반드시 함께 업데이트:**
| 파일 | 업데이트 내용 |
|------|--------------|
| `../docs/API.md` | API 엔드포인트 추가/변경 시 |
| `../docs/DATABASE.md` | DB 스키마 변경 시 |
| `../docs/FRONTEND.md` | 페이지/컴포넌트 추가, 버전 변경 시 |
| `../docs/FEATURE_PLAN.md` | 기능 완료/추가 시 체크리스트 업데이트 |

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

### v0.4.23 (2026-01-19)
- **카카오 공유에 실기 단위 표시**
  - DB: `practical_event_units` 테이블 추가 (96개 종목)
  - API: 실기 배점표 조회 시 `units` 필드 반환
  - 프론트: 카카오 공유 메시지에 단위 표시 (예: 5.21초, 285cm)

### v0.4.22 (2026-01-19)
- **카카오 공유 기능 완성**
  - 텍스트형 공유 (글자 제한 적음, 링크 클릭 가능)
  - 메시지 형식: 대학명 → 학과명 → 총점 → 수능/내신/실기 → 실기 종목별 기록
  - 감수 표기: (1감), (만점) 형식
  - 소숫점 포맷: .0이면 정수, 아니면 1자리
- **파일**: `src/lib/kakao-share.ts`
- **카카오 설정 필요**:
  - 플랫폼 > Web > 사이트 도메인: `https://sjungsi.vercel.app`
  - 제품 링크 관리 > 웹 도메인: `https://sjungsi.vercel.app`

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

---

## TODO: 실기 종목 단위 추가

### 목표
카카오 공유 시 실기 기록에 단위 표시 (예: 5.21초, 285cm, 12.5m)

### DB 변경
**테이블**: `practical_event_units` (새로 생성)
```sql
CREATE TABLE practical_event_units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(50) NOT NULL UNIQUE,
  unit VARCHAR(10) NOT NULL,  -- 초, cm, m, 회, 점 등
  direction ENUM('lower', 'higher') DEFAULT 'higher'
);
```

### 수정 필요한 파일
| 위치 | 파일 | 수정 내용 |
|------|------|----------|
| **API** | `api/src/saas/universities/saved-universities.service.ts` | 실기 배점표 조회 시 unit 포함 |
| **Web** | `src/lib/kakao-share.ts` | 공유 메시지에 단위 표시 |
| **Web** | `src/app/my-universities/page.tsx` | 실기 입력 UI에 단위 표시 (선택) |

### 종목별 단위 목록 (확인 필요)

#### 시간 (초)
- 100m, 100m달리기, 50m달리기, 60m달리기, 80m달리기
- 10m왕복달리기, 10m반복달리기, 20m왕복달리기, 25m왕복달리기
- Z런, Z자달리기, 셔틀런, 십자달리기, 지그재그런
- 20초사이드스텝, 사이드스텝
- 중량메고달리기, 허들

#### 거리 - cm
- 제자리멀리뛰기, 제자리세단뛰기
- 서전트점프, 높이뛰기
- 좌전굴, 장좌체전굴, 체전굴, 배후굴

#### 거리 - m
- 메디신볼던지기, 앉아메디신볼던지기
- 농구공던지기, 핸드볼공던지기
- 드라이버샷, 아이언샷, 우드샷, 어프로치

#### 횟수 (회)
- 윗몸일으키기, 턱걸이, 팔굽혀매달리기
- 농구레이업, 농구골밑슛, 배구, 핸드볼공벽치기

#### 기타/점수 (점)
- 체조, 핸스 관련 자세 (도입/중간/착지)
- 농구/배구/축구 스킬테스트

### 작업 순서
1. 위 종목 목록 확인 (사용자에게 질문)
2. DB 테이블 생성 + 데이터 INSERT
3. API 수정 (unit 반환)
4. 프론트 수정 (카카오 공유에 단위 표시)

---

## TODO: 배점표 관리 기능 추가

### 참고 파일 (maxjungsi222/)
| 파일 | 설명 | 특징 |
|------|------|------|
| `practical_editor.html` | Handsontable 기반 에디터 | 엑셀처럼 인라인 편집, 종목별/성별 그룹핑 |
| `silgi-editor.html` | 기본 CRUD 에디터 | Select2 검색, 대량 붙여넣기 지원 |

### API 엔드포인트 (supermax.kr)

#### 기본 CRUD (silgi-editor)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/jungsi/schools/{year}` | 학교 목록 조회 |
| GET | `/jungsi/practical-scores/{U_ID}/{year}` | 배점표 조회 |
| POST | `/jungsi/practical-scores/save` | 한 줄 추가 |
| DELETE | `/jungsi/practical-scores/delete/{id}` | 한 줄 삭제 |
| POST | `/jungsi/practical-scores/bulk-save` | 대량 추가 (엑셀 붙여넣기) |

#### 고급 에디터 (practical_editor)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/jungsi/admin/practical-table/schools?year={year}` | 학교 목록 (배점표 있는 학교만) |
| GET | `/jungsi/admin/practical-table/data?year={year}&U_ID={U_ID}` | 배점표 데이터 |
| POST | `/jungsi/admin/practical-table/bulk-update` | 일괄 저장 (추가/수정/삭제) |

### 배점표 데이터 구조
```json
{
  "id": 123,
  "종목명": "100m",
  "성별": "남",
  "기록": "12.50",
  "배점": "100"
}
```

### 대량 추가 (bulk-save) Payload
```json
{
  "U_ID": 177,
  "year": 2027,
  "eventName": "100m",
  "gender": "남",
  "rows_text": "12.50\t100\n12.60\t99\n12.70\t98"
}
```

### 일괄 저장 (bulk-update) Payload
```json
{
  "U_ID": 177,
  "year": 2027,
  "updates": [{ "id": 123, "기록": "12.55", "배점": "99" }],
  "additions": [{ "종목명": "100m", "성별": "남", "기록": "13.00", "배점": "95" }],
  "deletions": [124, 125]
}
```

### 구현 시 참고사항
1. **Handsontable**: 엑셀처럼 인라인 편집, 무료 non-commercial 라이선스
2. **Select2**: 학교 검색용 자동완성 select
3. **JWT 인증**: localStorage에 `jwt_token` 저장
4. **변경 감지**: 원본 데이터와 현재 데이터 비교하여 추가/수정/삭제 분류
