# RAG.OS Frontend

LangChain 기반 RAG 서비스의 프론트엔드 애플리케이션.

## 기술 스택

| 카테고리 | 기술 |
|----------|------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Server State | TanStack Query 5 |
| Client State | Zustand 5 |
| HTTP | ky |
| Form | React Hook Form + Zod |
| Icons | Iconify (Solar) |
| Testing | Vitest + Testing Library |

## 시작하기

### 요구사항

- Node.js 22+
- 백엔드 서버 (`http://localhost:8004`)

### 설치 및 실행

```bash
npm install
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.
API 요청은 Vite proxy를 통해 `http://localhost:8004`로 전달됩니다.

### 환경 변수

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8004
```

## 명령어

```bash
npm run dev           # 개발 서버
npm run build         # 프로덕션 빌드
npm run preview       # 빌드 결과 미리보기
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # 테스트
npm run test:watch    # 테스트 (watch)
npm run test:coverage # 테스트 커버리지
```

## 프로젝트 구조

```
src/
├── api/                  # API 클라이언트 및 엔드포인트 모듈
│   ├── client.ts         # ky 인스턴스 (토큰 자동 주입, 401 갱신)
│   ├── auth.ts           # 인증 API (register, login, logout, refresh)
│   └── chat.ts           # 채팅 API (동기, SSE 스트리밍, 대화 목록)
│
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트 (예정)
│   ├── chat/             # 채팅 관련 (Phase 3)
│   ├── sidebar/          # 사이드바 관련 (Phase 3)
│   ├── documents/        # 문서 관련 (Phase 4)
│   └── shared/           # 공통 (ProtectedRoute, GuestRoute, ThemeToggle)
│
├── hooks/                # 커스텀 훅 (Phase 2+)
│
├── layouts/              # 레이아웃 컴포넌트
│   ├── AppLayout.tsx     # 메인 앱 (사이드바 포함, Phase 3)
│   ├── AuthLayout.tsx    # 인증 페이지
│   └── ShareLayout.tsx   # 공유 세션 뷰
│
├── pages/                # 페이지 컴포넌트
│   ├── landing/          # 랜딩 페이지 (4-섹션 스냅 스크롤)
│   ├── Login.tsx         # 로그인 (Phase 2)
│   ├── Register.tsx      # 회원가입 (Phase 2)
│   ├── Chat.tsx          # 채팅 (Phase 3)
│   └── SharedSession.tsx # 공유 세션 (Phase 5)
│
├── stores/               # Zustand 스토어
│   ├── authStore.ts      # 인증 상태 + localStorage 동기화
│   └── themeStore.ts     # 라이트/다크/시스템 테마
│
├── types/                # TypeScript 타입 정의
│   ├── api.ts            # ApiResponse, ApiError
│   ├── auth.ts           # 인증 요청/응답 타입
│   └── chat.ts           # 채팅, 대화, SSE 이벤트 타입
│
├── lib/                  # 유틸리티
│   ├── utils.ts          # cn() (clsx + tailwind-merge)
│   ├── constants.ts      # 상수 (APP_NAME, API_BASE_URL 등)
│   └── format.ts         # 날짜, 파일 크기 포맷팅
│
├── App.tsx               # 라우터 설정
├── main.tsx              # 앱 진입점
└── index.css             # Tailwind 글로벌 스타일 + 다크 모드
```

## 백엔드 연동

백엔드 프로젝트: `langchain-chat/`

```bash
# 백엔드 실행
cd ../langchain-chat
uvicorn app.main:app --reload --port 8004
```

API 명세: 백엔드 `openapi.json` 참조.
