# Phase 1: 프로젝트 초기 설정

## 목표

React + TypeScript + Vite 프로젝트를 생성하고, 핵심 라이브러리 및 개발 도구를 설정한다.

## 작업 목록

### 1.1 프로젝트 생성

```bash
npm create vite@latest . -- --template react-ts
```

### 1.2 핵심 의존성 설치

```bash
# UI 프레임워크
npm install tailwindcss @tailwindcss/vite

# shadcn/ui (CLI로 초기화)
npx shadcn@latest init

# 라우팅
npm install react-router

# 서버 상태 관리
npm install @tanstack/react-query

# 전역 상태 관리
npm install zustand

# HTTP 클라이언트
npm install ky

# 폼 + 유효성 검증
npm install react-hook-form @hookform/resolvers zod

# 아이콘
npm install @iconify/react

# 마크다운 렌더링
npm install react-markdown remark-gfm rehype-highlight

# 유틸리티
npm install clsx tailwind-merge date-fns
```

### 1.3 개발 의존성 설치

```bash
# 테스트
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @testing-library/user-event
npm install -D playwright @playwright/test

# 린트 & 포맷
npm install -D eslint @eslint/js typescript-eslint
npm install -D prettier prettier-plugin-tailwindcss
```

### 1.4 디렉토리 구조 생성

```
src/
├── api/                  # API 클라이언트, 엔드포인트별 모듈
│   ├── client.ts         # ky 인스턴스 (인터셉터, base URL)
│   ├── auth.ts           # 인증 API
│   ├── chat.ts           # 채팅 API
│   ├── conversations.ts  # 대화 API
│   ├── documents.ts      # 문서 API (Phase 4)
│   ├── folders.ts        # 폴더 API (Phase 4)
│   └── sessions.ts       # 세션 API (Phase 4)
│
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── chat/             # 채팅 관련 컴포넌트
│   ├── sidebar/          # 사이드바 관련 컴포넌트
│   ├── documents/        # 문서 관련 컴포넌트
│   └── shared/           # 공통 컴포넌트 (로딩, 에러 등)
│
├── hooks/                # 커스텀 훅
│   ├── useAuth.ts        # 인증 상태 훅
│   ├── useChat.ts        # 채팅 SSE 훅
│   └── useTheme.ts       # 테마 전환 훅
│
├── layouts/              # 레이아웃 컴포넌트
│   ├── AppLayout.tsx     # 메인 앱 레이아웃 (사이드바 포함)
│   ├── AuthLayout.tsx    # 인증 페이지 레이아웃
│   └── ShareLayout.tsx   # 공유 뷰 레이아웃
│
├── pages/                # 페이지 컴포넌트
│   ├── Landing.tsx       # 랜딩 페이지
│   ├── Login.tsx         # 로그인
│   ├── Register.tsx      # 회원가입
│   ├── Chat.tsx          # 채팅 메인
│   └── SharedSession.tsx # 공유 세션 뷰
│
├── stores/               # Zustand 스토어
│   ├── authStore.ts      # 인증 상태
│   ├── chatStore.ts      # 채팅 상태
│   └── themeStore.ts     # 테마 상태
│
├── types/                # TypeScript 타입 정의
│   ├── api.ts            # API 응답 타입
│   ├── auth.ts           # 인증 관련 타입
│   ├── chat.ts           # 채팅 관련 타입
│   └── document.ts       # 문서 관련 타입
│
├── lib/                  # 유틸리티 함수
│   ├── utils.ts          # clsx + tailwind-merge (cn 함수)
│   ├── constants.ts      # 상수 정의
│   └── format.ts         # 날짜/파일 크기 포맷팅
│
├── App.tsx               # 라우터 설정
├── main.tsx              # 앱 진입점
└── index.css             # Tailwind 글로벌 스타일
```

### 1.5 기본 설정 파일

#### `src/api/client.ts` - API 클라이언트 설정

```typescript
import ky from 'ky'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8004'

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          // 토큰 갱신 로직 트리거
        }
      },
    ],
  },
})
```

#### `src/types/api.ts` - API 공통 타입

```typescript
export interface ApiResponse<T> {
  status: number
  message: string
  data: T | null
}

export interface ApiError {
  status: number
  message: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  next_cursor: string | null
  has_next: boolean
}
```

#### `src/lib/utils.ts` - 유틸리티

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 1.6 환경 변수 설정

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8004
```

```env
# .env.production
VITE_API_BASE_URL=https://api.ragos.io
```

### 1.7 Tailwind CSS 다크 모드 설정

```css
/* src/index.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

### 1.8 테스트 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
})
```

## 완료 기준

- [ ] Vite + React + TypeScript 프로젝트 정상 빌드
- [ ] Tailwind CSS 적용 확인 (라이트/다크 모드 전환)
- [ ] shadcn/ui 버튼 컴포넌트 렌더링 확인
- [ ] `npm run dev`로 개발 서버 실행
- [ ] `npm run test`로 테스트 환경 동작 확인
- [ ] ESLint + Prettier 린트 통과
