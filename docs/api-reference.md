# API Reference

> 이 문서는 백엔드 `openapi.json` 기반으로 작성되었다. 백엔드 API가 업데이트되면 이 문서도 함께 갱신한다.

## 공통 사항

### Base URL

```
개발: http://localhost:8004
환경변수: VITE_API_BASE_URL
```

### 응답 형식

모든 API는 통합 응답 형식을 사용한다.

```typescript
interface ApiResponse<T> {
  status: number    // HTTP 상태 코드
  message: string   // "Success" 또는 에러 메시지
  data: T | null    // 응답 데이터
}
```

### 에러 응답

```typescript
// 422 Validation Error
interface HTTPValidationError {
  detail: ValidationError[]
}

interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}
```

### 인증

인증이 필요한 API는 `Authorization` 헤더에 Bearer 토큰을 포함한다.

```
Authorization: Bearer {access_token}
```

---

## 1. 인증 (Auth)

### POST `/api/auth/register`

회원가입

```typescript
// Request
interface RegisterRequest {
  email: string       // 이메일 형식
  password: string    // 8-128자, 대소문자+숫자+특수문자
  username: string    // 2-100자
}

// Response (201)
interface ApiResponse<RegisterResponse> {
  data: {
    user: UserResponse
    tokens: TokenResponse
  }
}
```

### POST `/api/auth/login`

로그인

```typescript
// Request
interface LoginRequest {
  email: string
  password: string
}

// Response (200)
interface ApiResponse<TokenResponse> {
  data: {
    access_token: string
    refresh_token: string
    token_type: string      // "bearer"
    expires_in: number      // 초 단위
  }
}
```

### POST `/api/auth/logout`

로그아웃

```typescript
// Request
interface LogoutRequest {
  refresh_token?: string    // 선택사항
}

// Response (200)
interface ApiResponse<MessageResponse> {
  data: { message: string }
}
```

### POST `/api/auth/refresh`

토큰 갱신

```typescript
// Request
interface RefreshRequest {
  refresh_token: string
}

// Response (200) — TokenResponse와 동일
```

---

## 2. 채팅 (Chat)

### POST `/api/v1/chat`

동기 채팅 (비스트리밍)

```typescript
// Request
interface ChatRequest {
  message: string              // 1-4000자
  conversation_id?: string     // 기존 대화 ID (없으면 새 대화)
  use_web_search?: boolean     // 웹 검색 사용 (기본: true)
}

// Response (200)
interface ApiResponse<ChatResponse> {
  data: {
    message: string
    conversation_id: string
    session_id: number
    sources: string[]
    created_at: string          // ISO 8601
  }
}
```

### POST `/api/v1/chat/stream`

SSE 스트리밍 채팅

```typescript
// Request — ChatRequest와 동일
// Response — text/event-stream

// SSE 이벤트 타입:
// event: token       → 응답 텍스트 청크
// event: tool_call   → 도구 호출 시작 (웹 검색 등)
// event: tool_result → 도구 실행 결과
// event: done        → 완료 (conversation_id, sources)
// event: error       → 에러

// 파싱 예시:
// data: {"event": "token", "data": "안녕"}
// data: {"event": "tool_call", "data": {"tool": "web_search", "query": "..."}}
// data: {"event": "done", "data": {"conversation_id": "...", "sources": [...]}}
```

---

## 3. 대화 (Conversations)

### GET `/api/v1/conversations`

대화 목록 (커서 기반 페이지네이션)

```typescript
// Query Parameters
interface ConversationListParams {
  cursor?: string     // 페이지네이션 커서
  limit?: number      // 1-100 (기본: 20)
}

// Response (200)
interface ApiResponse<ConversationListResponse> {
  data: {
    conversations: ConversationSummary[]
    next_cursor: string | null
    has_next: boolean
  }
}

interface ConversationSummary {
  conversation_id: string
  title: string | null
  last_message_preview: string | null
  created_at: string    // ISO 8601
  updated_at: string    // ISO 8601
}
```

---

## 4. 문서 (Documents) — 추가 예정

> 백엔드 구현 후 `openapi.json` 업데이트 시 이 섹션을 갱신한다.

### POST `/api/v1/documents`

문서 업로드 (multipart/form-data)

```typescript
// Form Data
interface DocumentUploadRequest {
  file: File                           // PDF, TXT, MD, DOCX
  document_type?: 'LIBRARY' | 'ADHOC'  // 기본: LIBRARY
  folder_id?: number
  overwrite?: boolean                   // 기본: false
}

// Response (201)
interface ApiResponse<Document> {
  data: Document    // 문서 메타데이터
}

// 409 Conflict — 중복 파일 (overwrite=false일 때)
```

### GET `/api/v1/documents`

문서 목록 조회

```typescript
// Query Parameters
interface DocumentListParams {
  document_type?: 'LIBRARY' | 'ADHOC'
  folder_id?: number
  skip?: number
  limit?: number
}
```

### GET `/api/v1/documents/{document_id}/status`

문서 처리 상태 조회

```typescript
// Response
interface DocumentStatus {
  processing_status: 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED'
  processing_error: string | null
  chunk_count: number | null
  processed_at: string | null
}
```

---

## 5. 폴더 (Folders) — 추가 예정

### POST `/api/v1/folders`

```typescript
interface CreateFolderRequest {
  name: string
  description?: string
  instructions?: string    // RAG 시스템 프롬프트
}
```

### GET `/api/v1/folders`

### PATCH `/api/v1/folders/{folder_id}`

```typescript
interface UpdateFolderRequest {
  name?: string
  description?: string
  instructions?: string
}
```

### DELETE `/api/v1/folders/{folder_id}`

### POST `/api/v1/folders/{folder_id}/documents`

```typescript
// Form Data
interface AddDocumentToFolderRequest {
  document_id: number
}
```

### DELETE `/api/v1/folders/{folder_id}/documents/{document_id}`

---

## 6. 세션 (Sessions) — 추가 예정

### POST `/api/v1/sessions`

```typescript
interface CreateSessionRequest {
  title: string
  folder_id?: number
}
```

### GET `/api/v1/sessions`

### GET `/api/v1/sessions/{session_id}`

### DELETE `/api/v1/sessions/{session_id}`

---

## 7. 세션 공유 (Session Sharing) — 추가 예정

### POST `/api/v1/sessions/{session_id}/share`

공유 링크 생성 (소유자만)

```typescript
// Response
interface ShareResponse {
  share_token: string
  share_url: string
}
```

### DELETE `/api/v1/sessions/{session_id}/share`

공유 취소 (소유자만)

### GET `/api/v1/sessions/shared/{share_token}`

공유 세션 조회 (**Public**, 인증 불필요)

```typescript
// Response
interface SharedSessionResponse {
  title: string
  messages: SharedMessage[]
}

interface SharedMessage {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  citations: Citation[] | null
  created_at: string
}
```

---

## 타입 정리

### UserResponse

```typescript
interface UserResponse {
  id: number
  email: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}
```

### TokenResponse

```typescript
interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}
```
