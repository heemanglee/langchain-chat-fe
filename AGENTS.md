# AGENTS.md

This file provides guidance to Codex CLI when working with code in this repository.

## Project Overview

RAG.OS 프론트엔드 애플리케이션. LangChain 기반 RAG 서비스의 웹 인터페이스를 제공한다.

- **Runtime:** Node.js 22+
- **Framework:** React 19 + Vite
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4.x + shadcn/ui
- **State:** Zustand (클라이언트), TanStack Query v5 (서버)

## Commands

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm run test

# 테스트 (커버리지)
npm run test:coverage

# 린트
npm run lint

# 포맷
npm run format

# E2E 테스트
npx playwright test
```

## Architecture

```
Pages (pages/) → Hooks (hooks/) → API (api/) → Backend
      ↓               ↓
  Components      Stores (zustand)
  (components/)
```

### 디렉토리 구조

```
src/
├── api/          # API 클라이언트 및 엔드포인트 모듈
├── components/   # 재사용 가능한 UI 컴포넌트
│   ├── ui/       # shadcn/ui 컴포넌트
│   ├── chat/     # 채팅 관련
│   ├── sidebar/  # 사이드바 관련
│   ├── documents/ # 문서 관련
│   └── shared/   # 공통 (로딩, 에러 등)
├── hooks/        # 커스텀 훅
├── layouts/      # 레이아웃 컴포넌트
├── pages/        # 페이지 컴포넌트
├── stores/       # Zustand 스토어
├── types/        # TypeScript 타입 정의
└── lib/          # 유틸리티 함수
```

### Key Routes

| Path | 설명 | Auth |
|------|------|------|
| `/` | 랜딩 페이지 | Public |
| `/login` | 로그인 | Guest Only |
| `/register` | 회원가입 | Guest Only |
| `/chat` | 새 채팅 | Protected |
| `/chat/:conversationId` | 기존 대화 | Protected |
| `/share/:shareToken` | 공유 세션 | Public |

## Backend API

- **Base URL:** `VITE_API_BASE_URL` 환경변수 (기본: `http://localhost:8004`)
- **인증:** Bearer Token (JWT) — `Authorization: Bearer {access_token}`
- **응답 형식:** `{ status: number, message: string, data: T | null }`
- **API 명세:** `../langchain-chat/openapi.json` (Single Source of Truth)
- **SSE 스트리밍:** `POST /api/v1/chat/stream` — `token`, `tool_call`, `tool_result`, `done`, `error` 이벤트

### API 연동 규칙

- API 관련 기능 구현 시 반드시 `../langchain-chat/openapi.json`을 먼저 읽고 엔드포인트와 스키마를 확인한다
- 프론트엔드의 TypeScript 타입(`src/types/`)은 `openapi.json`의 스키마와 일치해야 한다
- 백엔드 스키마가 변경되면 프론트엔드 타입도 함께 업데이트한다

## PRD & 개발 문서

- `docs/00-overview.md` — 전체 개요 및 로드맵
- `docs/phase-1-project-setup.md` — 프로젝트 초기 설정
- `docs/phase-2-auth.md` — 인증
- `docs/phase-3-layout-chat.md` — 레이아웃 + 채팅
- `docs/phase-4-documents-folders.md` — 문서/폴더 관리
- `docs/phase-5-sharing-landing.md` — 공유 + 랜딩 페이지
- `docs/phase-6-dark-mode-polish.md` — 다크 모드 + UX 폴리싱

---

# Design System

## 색상 시스템

모든 컴포넌트는 라이트/다크 모드를 동시에 지원해야 한다. Tailwind의 `dark:` variant를 사용한다.

### 기본 색상 매핑

```
배경 (페이지):      bg-zinc-50          dark:bg-zinc-950
배경 (사이드바):    bg-white            dark:bg-zinc-900
배경 (카드):        bg-white            dark:bg-zinc-800
배경 (hover):      hover:bg-zinc-100    dark:hover:bg-zinc-800

텍스트 (기본):      text-zinc-950       dark:text-zinc-50
텍스트 (보조):      text-zinc-600       dark:text-zinc-400
텍스트 (약한):      text-zinc-400       dark:text-zinc-500

보더 (기본):        border-zinc-200     dark:border-zinc-700
보더 (hover):      hover:border-zinc-300 dark:hover:border-zinc-600
```

### 시맨틱 색상

```
성공 (초록):    bg-emerald-50 text-emerald-600    dark:bg-emerald-950 dark:text-emerald-400
경고 (노랑):    bg-yellow-50 text-yellow-800      dark:bg-yellow-950 dark:text-yellow-200
에러 (빨강):    bg-red-50 text-red-600            dark:bg-red-950 dark:text-red-400
정보 (파랑):    bg-blue-50 text-blue-600          dark:bg-blue-950 dark:text-blue-400
```

## 타이포그래피

- 기본: `Inter` (Google Fonts)
- 코드: `JetBrains Mono` 또는 시스템 monospace

```
텍스트 xs:   text-xs     (12px) — 메타데이터, 배지
텍스트 sm:   text-sm     (14px) — 보조 텍스트
텍스트 base: text-base   (16px) — 본문, 메시지
텍스트 lg:   text-lg     (18px) — 섹션 제목
텍스트 xl:   text-xl     (20px) — 페이지 제목
```

## 아이콘

Iconify Solar 아이콘셋 사용:

```typescript
import { Icon } from '@iconify/react'
<Icon icon="solar:folder-check-linear" width={24} />
```

## 레이아웃 규칙

- Navbar: 고정 상단 (h-14), `bg-white/80 backdrop-blur-md dark:bg-zinc-900/80`
- Sidebar: `w-[280px]` (펼침), `w-0` (접힘), 모바일에서 오버레이
- Chat Area: `flex-1, overflow-y-auto, max-w-3xl mx-auto`
- 메시지 입력: `sticky bottom-0`

## 금지 사항

- `#hex` 색상 직접 사용 금지 → Tailwind 색상 클래스
- `px` 단위 직접 사용 금지 → Tailwind 간격 체계
- 인라인 `style={}` 금지 → Tailwind 클래스
- `!important` 사용 금지
- 라이트 모드만 스타일링 금지 → 항상 `dark:` variant 포함

---

# Frontend Architecture

## 컴포넌트 설계 원칙

### 파일 구성
- 컴포넌트 1개 = 파일 1개
- 파일명: `PascalCase.tsx` (컴포넌트), `camelCase.ts` (유틸리티/훅)
- 200-400줄 권장, 800줄 초과 금지

### 컴포넌트 구조

```typescript
// 1. imports
// 2. 타입/인터페이스 정의
// 3. 컴포넌트 함수 (function 키워드 사용)
// 4. export

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  return (...)
}

export { ChatMessage }
```

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ChatMessage.tsx` |
| 훅 | camelCase, `use` 접두사 | `useChat.ts` |
| 유틸리티 | camelCase | `formatDate.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_MESSAGE_LENGTH` |
| 타입 | PascalCase | `ChatRequest` |
| 스토어 | camelCase, `Store` 접미사 | `authStore.ts` |

## 상태 관리 전략

| 상태 유형 | 관리 방법 | 예시 |
|-----------|-----------|------|
| 서버 상태 | TanStack Query | 대화 목록, 문서 목록 |
| 전역 클라이언트 상태 | Zustand | 인증, 테마, 사이드바 |
| 로컬 UI 상태 | useState/useReducer | 모달 열림, 입력값 |
| URL 상태 | React Router | 현재 대화 ID |

### Zustand 스토어 규칙

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  setTokens: (tokens: TokenResponse) => void
  clearAuth: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setTokens: (tokens) => set({ accessToken: tokens.access_token }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

### TanStack Query 규칙

- queryKey는 배열 형태로 도메인별 계층 구조
- 낙관적 업데이트 패턴 사용

## API 클라이언트 규칙

### ky 인스턴스 설정

- prefixUrl: `VITE_API_BASE_URL`
- beforeRequest: Authorization 헤더 자동 추가
- afterResponse: 401 → 토큰 갱신 → 재시도

### SSE 스트리밍 패턴

- fetch API + ReadableStream 사용
- AbortController로 중단 기능
- 이벤트 타입별 핸들러 분기

## import 규칙

```typescript
// 1. React/외부 라이브러리
import { useState } from 'react'

// 2. 내부 모듈 (path alias: @/)
import { apiClient } from '@/api/client'

// 3. 컴포넌트
import { Button } from '@/components/ui/button'

// 4. 타입 (type import)
import type { Message } from '@/types/chat'
```

## 금지 사항

- `any` 타입 사용 금지 → `unknown` 또는 구체적 타입
- 인라인 스타일 금지 → Tailwind 클래스
- CSS 모듈/별도 CSS 파일 금지 → Tailwind 인라인
- `useEffect`로 데이터 페칭 금지 → TanStack Query
- prop drilling 3단계 이상 금지 → Zustand
- `index.ts` 배럴 파일 금지 → 직접 파일 경로 import
- `console.log` 커밋 금지
- 하드코딩된 API URL 금지 → 환경변수

---

# Frontend Testing

## 테스트 스택

- **단위/통합 테스트:** Vitest + @testing-library/react
- **E2E 테스트:** Playwright
- **최소 커버리지:** 80%

## 테스트 파일 위치

```
src/
├── components/
│   └── chat/
│       ├── ChatMessage.tsx
│       └── ChatMessage.test.tsx    ← 컴포넌트와 같은 디렉토리
├── hooks/
│   ├── useChat.ts
│   └── useChat.test.ts
```

## 컴포넌트 테스트 패턴

```typescript
import { render, screen } from '@testing-library/react'
import { ChatMessage } from './ChatMessage'

describe('ChatMessage', () => {
  it('renders user message content', () => {
    render(<ChatMessage message={mockMessage} />)
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
  })
})
```

## TDD 필수 워크플로우

```
RED → GREEN → REFACTOR → REPEAT
1. 테스트 먼저 작성 (RED)
2. 테스트 실행 - 실패해야 함
3. 최소 구현 작성 (GREEN)
4. 테스트 실행 - 통과해야 함
5. 리팩토링 (IMPROVE)
6. 커버리지 확인 (80%+)
```

## 필수 테스트 케이스

### 인증
- [ ] 로그인 폼 유효성 검증
- [ ] 로그인 성공 시 리다이렉트
- [ ] 401 시 토큰 자동 갱신
- [ ] 로그아웃 후 상태 초기화

### 채팅
- [ ] 메시지 전송 및 표시
- [ ] SSE 스트리밍 렌더링
- [ ] 마크다운 렌더링
- [ ] 스트리밍 중단

### 사이드바
- [ ] 대화 목록 표시
- [ ] 대화 선택 및 전환

---

# GitHub Issue & PR 규칙

## Issue 생성

```markdown
## Summary
한 줄로 변경 목적을 요약한다.

## Background
- 변경이 필요한 이유, 배경 설명

## Changes
- 구체적인 코드/파일 변경 사항

## Impact
- 변경이 다른 코드/시스템에 미치는 영향

## Checklist
- [ ] 주요 변경 항목
- [ ] 로컬 테스트 완료
```

- 제목: `type: 설명` 형식 (feat, fix, refactor, docs, test, chore, perf, ci)
- 본문: 한국어

### Label 목록

| Label | 설명 |
|-------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 코드 리팩토링 |
| `docs` | 문서 추가/수정 |
| `test` | 테스트 추가/수정 |
| `chore` | 설정, 의존성 등 |

## PR 생성

```markdown
## Summary
- 변경사항 요약

## Changes
### New Files
| File | Description |

### Modified Files
| File | Changes |

## Test Plan
- [x] 테스트 항목

Closes #이슈번호
```

- PR 제목 70자 이내
- `Closes #이슈번호` 필수
- 한국어로 작성

## 브랜치 네이밍

```
feat/{issue_number}-{짧은-설명}
fix/{issue_number}-{짧은-설명}
refactor/{issue_number}-{짧은-설명}
```

---

# Planning Workflow

계획 승인 후 실행 순서:

```
Plan 승인 → Issue 생성 → 브랜치 생성 → 구현 → 커밋 → PR 생성
                ↓              ↓                        ↓
          Issue #번호    {type}/{#}-{desc}      Closes #{번호}
```

1. **GitHub Issue 생성** — `gh issue create`
2. **브랜치 생성** — `git checkout -b {type}/{issue_number}-{description}`
3. **구현 시작** — TDD 접근법 적용, 논리적 단위로 커밋
4. **PR 생성** — `Closes #이슈번호` 포함

## 금지 사항

- Issue 생성 없이 바로 코드 작성 시작 금지
- Issue 번호 없이 브랜치 생성 금지
- main 브랜치에서 직접 작업 금지

---

# 금지 사항 요약

## 코드
- `any` 타입 사용 금지
- `console.log` 사용 금지
- API 타입 수동 정의 금지 (openapi.json 기반 자동 생성)
- 테스트 없이 컴포넌트 커밋 금지
- 인라인 스타일 금지 (Tailwind 사용)
- Class Component 사용 금지

## 테스트
- 테스트 없이 구현 금지
- 커버리지 80% 미만으로 완료 금지

## Git
- main 브랜치에서 직접 작업 금지
- Issue 번호 없이 브랜치 생성 금지
