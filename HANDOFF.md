# Student Frontend - Handoff Document

## 프로젝트 개요

정시 환산점수 계산기의 학생용 프론트엔드가 성공적으로 구축되었습니다.

## 완성된 기능

### 1. 성적 입력 페이지 (/)
- ✅ 국어, 수학, 영어, 한국사, 탐구 성적 입력 폼
- ✅ 선택과목 드롭다운 (국어, 수학)
- ✅ 표준점수, 백분위, 등급 입력
- ✅ Form validation (react-hook-form + zod)
- ✅ LocalStorage 자동 저장

### 2. 전체 대학 결과 페이지 (/result)
- ✅ Batch API로 모든 대학 환산점수 계산
- ✅ 점수 높은 순 정렬
- ✅ 대학 카드 UI (대학명, 학과명, 모집군, 점수)
- ✅ 대학 클릭 → 상세 페이지 이동

### 3. 대학 상세 페이지 (/university/[id])
- ✅ 대학 기본 정보 (모집군, 모집인원, 지역)
- ✅ 환산점수 breakdown (국어, 수학, 영어, 탐구, 한국사)
- ✅ 전형 비율 시각화 (수능 vs 실기)
- ✅ 입력한 성적 정보 표시

### 4. 저장된 성적 페이지 (/saved)
- ✅ LocalStorage에서 성적 불러오기
- ✅ 저장된 성적으로 재계산
- ✅ 성적 삭제

### 5. UI 컴포넌트
- ✅ 하단 네비게이션 바 (성적입력 / 대학목록 / 저장)
- ✅ shadcn/ui 컴포넌트 (Button, Input, Card, Label, Select, Badge)
- ✅ 모바일 최적화 (반응형 디자인)
- ✅ 다크모드 지원

## 기술 스택

```
Framework:      Next.js 15 (App Router)
Language:       TypeScript
Styling:        Tailwind CSS v3
UI Library:     shadcn/ui
Form:           react-hook-form + zod
Icons:          Lucide React
State:          React useState + sessionStorage
```

## 파일 구조

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 메인 (성적 입력)
│   │   ├── result/page.tsx             # 결과 목록
│   │   ├── saved/page.tsx              # 저장된 성적
│   │   ├── university/[id]/page.tsx    # 대학 상세
│   │   ├── layout.tsx                  # 레이아웃
│   │   └── globals.css                 # 전역 스타일
│   ├── components/
│   │   ├── ui/                         # shadcn 컴포넌트
│   │   ├── bottom-nav.tsx              # 하단 네비
│   │   └── score-input-form.tsx        # 성적 입력 폼
│   ├── lib/
│   │   ├── api.ts                      # API 함수
│   │   ├── storage.ts                  # LocalStorage
│   │   └── utils.ts                    # 유틸리티
│   └── types/
│       └── index.ts                    # TypeScript 타입
├── public/
├── .env.local                          # 환경변수
├── package.json
└── README.md
```

## 실행 방법

### 1. 의존성 설치
```bash
cd ~/mprojects/web
npm install
```

### 2. 환경변수 설정
`.env.local` 파일에 API URL 설정:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:3002

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## API 연동

백엔드 API (`~/mprojects/api`)가 실행 중이어야 합니다:

```bash
cd ~/mprojects/api
npm run start:prod
```

### 사용 중인 API 엔드포인트
- `POST /calculate/batch` - 전체 대학 환산점수 계산
- `GET /universities?yearId=2026` - 대학 목록
- `GET /universities/:id` - 대학 상세

## 빌드 결과

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    52.9 kB         162 kB
├ ○ /_not-found                            993 B         103 kB
├ ○ /result                              2.08 kB         115 kB
├ ○ /saved                               3.53 kB         113 kB
└ ƒ /university/[id]                     3.73 kB         116 kB
```

✅ 모든 페이지가 성공적으로 빌드되었습니다.

## 다음 단계 (추천)

### Phase 7: 추가 기능
1. **필터링 & 검색**
   - 모집군별 필터 (가/나/다)
   - 지역별 필터
   - 대학명 검색

2. **정렬 옵션**
   - 환산점수 순
   - 대학명 순
   - 모집인원 순

3. **시나리오 저장**
   - 여러 성적 시나리오 저장 (LocalStorage)
   - 시나리오 비교 기능

### Phase 8: PWA & 배포
1. **PWA 변환**
   - Service Worker 추가
   - Manifest 파일
   - 오프라인 지원

2. **배포**
   - Vercel 또는 Netlify 배포
   - 환경변수 설정 (NEXT_PUBLIC_API_URL)

### Phase 9: 최적화
1. **성능 최적화**
   - Image 최적화
   - Code splitting
   - Loading states 개선

2. **UX 개선**
   - 스켈레톤 로더
   - 에러 처리 개선
   - Toast 알림

## 참고 문서

- [README.md](./README.md) - 프로젝트 개요 및 실행 방법
- [~/mprojects/docs/FRONTEND_SPEC.md](../docs/FRONTEND_SPEC.md) - 프론트엔드 스펙
- [~/mprojects/docs/API_REFERENCE.md](../docs/API_REFERENCE.md) - API 문서
- [~/mprojects/docs/CALCULATION_SPEC.md](../docs/CALCULATION_SPEC.md) - 계산 로직

## 알려진 이슈

현재 알려진 이슈 없음. 모든 기능이 정상 작동합니다.

## 지원

문제가 발생하거나 질문이 있으면 다음 문서를 참조하세요:
- API 문서: `~/mprojects/docs/API_REFERENCE.md`
- 계산 스펙: `~/mprojects/docs/CALCULATION_SPEC.md`
