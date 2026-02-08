# Frontend Testing 규칙

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
├── api/
│   ├── auth.ts
│   └── auth.test.ts
└── test/
    ├── setup.ts                    ← 글로벌 테스트 설정
    └── mocks/                      ← MSW 핸들러 등
```

## 테스트 네이밍

```typescript
// 파일: {모듈명}.test.ts(x)
// describe: 컴포넌트/함수명
// it/test: "동사 + 기대 결과" (한국어 가능)

describe('ChatMessage', () => {
  it('renders user message correctly', () => { ... })
  it('renders markdown in assistant message', () => { ... })
  it('shows streaming cursor when isStreaming is true', () => { ... })
})
```

## 컴포넌트 테스트 패턴

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatMessage } from './ChatMessage'

describe('ChatMessage', () => {
  const mockMessage = {
    id: '1',
    role: 'user' as const,
    content: '테스트 메시지',
    createdAt: '2024-01-01T00:00:00Z',
  }

  it('renders user message content', () => {
    render(<ChatMessage message={mockMessage} />)
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
  })
})
```

## 훅 테스트 패턴

```typescript
import { renderHook, act } from '@testing-library/react'
import { useChat } from './useChat'

// TanStack Query를 사용하는 훅은 QueryClientProvider 래퍼 필요
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useChat', () => {
  it('sends message and updates state', async () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    // ...
  })
})
```

## API 모킹

```typescript
// MSW (Mock Service Worker) 또는 vitest mock 사용

// vitest mock 패턴
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))
```

## E2E 테스트 (Playwright)

```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test'

test('sends a message and receives streaming response', async ({ page }) => {
  await page.goto('/chat')
  await page.getByPlaceholder('메시지를 입력하세요').fill('안녕하세요')
  await page.getByRole('button', { name: '전송' }).click()
  await expect(page.getByText('안녕하세요')).toBeVisible()
})
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
- [ ] 무한 스크롤

### 문서/폴더
- [ ] 파일 업로드
- [ ] 문서 목록 표시
- [ ] 폴더 CRUD
