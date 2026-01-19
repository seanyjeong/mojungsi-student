# API (NestJS) - v0.2.4

> **전체 프로젝트 명세**: `../docs/` 참조
> - `../docs/API.md` - API 엔드포인트 전체 명세
> - `../docs/DATABASE.md` - DB 스키마
> - `../docs/FRONTEND.md` - 프론트엔드

**포트**: 8900
**배포**: `npm run build && sudo systemctl restart jungsi-api`
**도메인**: `jungsi.sean8320.dedyn.io`

---

## 배포 명령어

```bash
# 빌드 & 재시작
npm run build && sudo systemctl restart jungsi-api

# 로그 확인
sudo journalctl -u jungsi-api -f
```

---

## 모듈 구조 (dist/src/)

```
├── prisma/           # DB 연결
├── universities/     # 대학 목록 (공개)
├── calculators/      # 점수 계산 (공개)
├── admin/            # 관리자 API
│   ├── auth/         # 관리자 JWT 인증
│   └── jungsi/       # 정시 데이터 관리
└── saas/             # SaaS 사용자 API
    ├── auth/         # 카카오 인증
    ├── profile/      # 프로필
    ├── scores/       # 성적
    ├── universities/ # 저장 대학
    └── practical/    # 실기 기록
```

---

## 주요 엔드포인트

### 점수 계산 (공개)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/calculate` | 단일 대학 환산점수 |
| POST | `/calculate/all` | 전체 대학 환산점수 |
| GET | `/calculate/university-list?year=` | 대학 목록 |

### SaaS (학생용, 🔒 인증 필요)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/saas/auth/kakao/login-url` | 카카오 로그인 URL |
| GET | `/saas/universities/saved` | 저장 대학 목록 |
| POST | `/saas/scores` | 성적 저장 |
| GET | `/saas/practical` | 실기 기록 목록 |

### 관리자
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/admin/jungsi/basic?year=` | 대학/학과 목록 |
| PUT | `/admin/jungsi/ratio/:U_ID/*` | 반영비율 수정 |
| GET | `/admin/jungsi/practical/:U_ID?year=` | 실기 배점표 |

> **전체 API 명세**: `../docs/API.md`

---

## 핵심 파일

| 파일 | 설명 |
|------|------|
| `calculators/calculators.service.js` | 점수 계산 로직 |
| `saas/auth/saas-auth.service.js` | 카카오 인증 |
| `saas/universities/saved-universities.service.js` | 저장 대학 + 실기배점표 조회 |
| `admin/jungsi/jungsi-admin.service.js` | 정시 데이터 CRUD |

---

## 환경변수 (.env)

```
DATABASE_URL=mysql://paca:PASSWORD@localhost:3306/univjungsi
JWT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_REDIRECT_URI=...
```

---

## 주의사항

1. **totalScore는 string**: 계산 결과 `totalScore`는 문자열, `parseFloat()` 필요
2. **U_ID 연도 매핑**: 2026=1~200, 2027=1001~1200, 2028=2001~2200
3. **실기배점표 조회**: 대학명+학과명으로 해당 연도 U_ID 찾아서 조회
