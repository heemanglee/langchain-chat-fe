# Frontend Architecture 규칙

## 컴포넌트 설계 원칙

### 파일 구성

- 컴포넌트 1개 = 파일 1개
- 파일명: `PascalCase.tsx` (컴포넌트), `camelCase.ts` (유틸리티/훅)
- 200-400줄 권장, 800줄 초과 금지
- 관련 스타일은 Tailwind 인라인으로 처리 (별도 CSS 파일 금지)

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
  // 훅 호출
  // 핸들러 정의
  // 렌더링
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
| 타입/인터페이스 | PascalCase | `ChatRequest` |
| 스토어 | camelCase, `Store` 접미사 | `authStore.ts` |
| API 모듈 | camelCase | `auth.ts`, `chat.ts` |

### Props 설계

```typescript
// WRONG: 과도한 prop drilling
<GrandChild userName={user.name} userEmail={user.email} userRole={user.role} />

// CORRECT: 객체 단위로 전달하거나 Zustand 스토어 사용
<GrandChild user={user} />
// 또는
function GrandChild() {
  const user = useAuthStore((state) => state.user)
  // ...
}
```

## 상태 관리 전략

### 분류 기준

| 상태 유형 | 관리 방법 | 예시 |
|-----------|-----------|------|
| 서버 상태 | TanStack Query | 대화 목록, 문서 목록 |
| 전역 클라이언트 상태 | Zustand | 인증, 테마, 사이드바 열림/닫힘 |
| 로컬 UI 상태 | useState/useReducer | 모달 열림, 입력값 |
| URL 상태 | React Router | 현재 대화 ID, 공유 토큰 |

### Zustand 스토어 규칙

```typescript
// 스토어는 도메인별로 분리
// persist 미들웨어로 localStorage 동기화 (필요 시)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  // actions
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

```typescript
// queryKey는 배열 형태로 도메인별 계층 구조
// ['conversations'] — 전체 목록
// ['conversations', conversationId] — 특정 대화
// ['documents', { folderId }] — 필터링된 문서

// 낙관적 업데이트 패턴
const mutation = useMutation({
  mutationFn: deleteConversation,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['conversations'] })
    const previous = queryClient.getQueryData(['conversations'])
    queryClient.setQueryData(['conversations'], (old) => /* 낙관적 제거 */)
    return { previous }
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(['conversations'], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  },
})
```

## API 클라이언트 규칙

### ky 인스턴스 설정

```typescript
// src/api/client.ts
// - prefixUrl: VITE_API_BASE_URL
// - beforeRequest: Authorization 헤더 자동 추가
// - afterResponse: 401 → 토큰 갱신 → 재시도
// - retry: { limit: 0 } (자체 재시도 로직 사용)
```

### API 모듈 패턴

```typescript
// src/api/conversations.ts
import { apiClient } from './client'
import type { ApiResponse, ConversationListResponse } from '@/types/api'

export async function fetchConversations(params?: { cursor?: string; limit?: number }) {
  return apiClient
    .get('api/v1/conversations', { searchParams: params })
    .json<ApiResponse<ConversationListResponse>>()
}
```

### SSE 스트리밍 패턴

```typescript
// fetch API + ReadableStream 사용 (ky의 SSE 미지원)
// AbortController로 중단 기능
// 이벤트 타입별 핸들러 분기

async function streamChat(request: ChatRequest, handlers: StreamHandlers, signal: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
    signal,
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  // ... SSE 파싱 로직
}
```

## 레이아웃 규칙

### 메인 앱 레이아웃

- Navbar: 고정 상단 (h-14)
- Sidebar: 왼쪽 고정 (w-[280px]), 모바일에서 오버레이
- Main Content: 나머지 영역 (flex-1)
- 채팅 입력: 하단 고정

### 반응형 브레이크포인트

```
< 640px  (sm): 모바일 — 사이드바 오버레이
< 1024px (lg): 태블릿 — 사이드바 접힌 상태
≥ 1024px (lg): 데스크톱 — 사이드바 펼친 상태
```

## import 규칙

```typescript
// 1. React/외부 라이브러리
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 내부 모듈 (path alias: @/)
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

// 3. 컴포넌트
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/ChatMessage'

// 4. 타입 (type import)
import type { Message, ChatRequest } from '@/types/chat'
```

## 금지 사항

- `any` 타입 사용 금지 → `unknown` 또는 구체적 타입
- 인라인 스타일 (`style={}`) 금지 → Tailwind 클래스 사용
- CSS 모듈/별도 CSS 파일 금지 → Tailwind 인라인
- `useEffect`로 데이터 페칭 금지 → TanStack Query 사용
- prop drilling 3단계 이상 금지 → Zustand 또는 Context
- `index.ts` 배럴 파일 금지 → 직접 파일 경로 import
- `console.log` 커밋 금지
- 하드코딩된 API URL 금지 → 환경변수
- `document.querySelector` 직접 DOM 조작 금지 → ref 사용
