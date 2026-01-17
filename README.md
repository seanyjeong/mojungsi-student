# 정시 환산점수 계산기 - Student Frontend

체대입시 학생들을 위한 수능 환산점수 계산 서비스 프론트엔드

**Version:** v0.1.1

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui
- **Form Management**: react-hook-form + zod
- **Icons**: Lucide React

## 프로젝트 구조

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 메인 (성적 입력 폼)
│   │   ├── result/
│   │   │   └── page.tsx          # 전체 대학 환산 결과
│   │   ├── university/
│   │   │   └── [id]/page.tsx     # 대학 상세
│   │   ├── saved/
│   │   │   └── page.tsx          # 저장된 성적
│   │   ├── layout.tsx            # 레이아웃 + 하단 네비
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn 컴포넌트
│   │   ├── bottom-nav.tsx        # 하단 네비게이션
│   │   └── score-input-form.tsx  # 성적 입력 폼
│   ├── lib/
│   │   ├── api.ts                # API 호출 함수
│   │   ├── storage.ts            # localStorage 관리
│   │   └── utils.ts              # 유틸리티 함수
│   └── types/
│       └── index.ts              # 타입 정의
├── public/
├── package.json
└── README.md
```

## 기능

### 1. 성적 입력 (/)
- 국어, 수학, 영어, 한국사, 탐구 성적 입력
- 선택과목 선택 (국어: 화법과작문/언어와매체, 수학: 확률과통계/미적분/기하)
- 표준점수, 백분위, 등급 입력
- LocalStorage에 자동 저장

### 2. 전체 대학 결과 (/result)
- 196개 대학의 환산점수 계산 (Batch API 사용)
- 점수 높은 순으로 정렬
- 대학명, 학과명, 모집군, 환산점수 표시
- 대학 클릭 시 상세 페이지로 이동

### 3. 대학 상세 (/university/[id])
- 대학 기본 정보 (모집군, 모집인원, 지역)
- 환산점수 breakdown (국어, 수학, 영어, 탐구, 한국사)
- 전형 비율 시각화 (수능 vs 실기)
- 입력한 성적 정보

### 4. 저장된 성적 (/saved)
- LocalStorage에 저장된 성적 확인
- 저장된 성적으로 재계산
- 성적 삭제

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

서버는 `http://localhost:3002`에서 실행됩니다.

### 4. 빌드

```bash
npm run build
npm start
```

## API 연동

이 프론트엔드는 `~/mprojects/api`의 백엔드 API와 통신합니다.

백엔드 API를 먼저 실행해야 합니다:

```bash
cd ~/mprojects/api
npm run start:prod  # 또는 npm run start:dev
```

### 사용하는 API 엔드포인트

- `POST /calculate/batch` - 전체 대학 환산점수 계산
- `GET /universities?yearId=2026` - 대학 목록 조회
- `GET /universities/:id` - 대학 상세 조회

자세한 API 문서는 `~/mprojects/docs/API_REFERENCE.md` 참조

## 모바일 최적화

- 모바일 퍼스트 디자인 (max-width: 640px 기준)
- 하단 네비게이션 바
- 터치 타겟 최소 48px
- 숫자 입력 시 숫자 키패드 자동 활성화

## 다크모드

- 시스템 테마에 따라 자동 전환
- Tailwind CSS의 `dark:` 모디파이어 사용

## 참고 문서

- [Frontend Spec](../docs/FRONTEND_SPEC.md)
- [API Reference](../docs/API_REFERENCE.md)
- [Calculation Spec](../docs/CALCULATION_SPEC.md)
