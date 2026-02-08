# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Design System

- **폰트:** Inter (Google Fonts)
- **아이콘:** Iconify Solar 아이콘셋 (`@iconify/react`)
- **색상 기준:** Tailwind zinc 팔레트
- **라이트/다크 모드:** Tailwind `dark:` variant, `<html class="dark">` 토글
- **컴포넌트:** shadcn/ui 기반 (Radix UI primitives)

## PRD & 개발 문서

- `docs/00-overview.md` — 전체 개요 및 로드맵
- `docs/phase-1-project-setup.md` — 프로젝트 초기 설정
- `docs/phase-2-auth.md` — 인증
- `docs/phase-3-layout-chat.md` — 레이아웃 + 채팅
- `docs/phase-4-documents-folders.md` — 문서/폴더 관리
- `docs/phase-5-sharing-landing.md` — 공유 + 랜딩 페이지
- `docs/phase-6-dark-mode-polish.md` — 다크 모드 + UX 폴리싱
