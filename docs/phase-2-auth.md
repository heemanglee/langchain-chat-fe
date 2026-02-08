# Phase 2: 인증 (Authentication)

## 목표

회원가입, 로그인, 로그아웃, 토큰 자동 갱신 기능을 구현한다.

## 의존 API

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/auth/register` | `{ email, password, username }` | `{ user, tokens }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token, refresh_token, token_type, expires_in }` |
| POST | `/api/auth/logout` | `{ refresh_token? }` | `{ message }` |
| POST | `/api/auth/refresh` | `{ refresh_token }` | `{ access_token, refresh_token, token_type, expires_in }` |

### 요청/응답 상세

#### 회원가입

```typescript
// Request
interface RegisterRequest {
  email: string        // 이메일 형식
  password: string     // 8-128자, 대소문자+숫자+특수문자 포함
  username: string     // 2-100자
}

// Response
interface RegisterResponse {
  user: {
    id: number
    email: string
    username: string
    role: string
    is_active: boolean
    created_at: string
  }
  tokens: TokenResponse
}
```

#### 로그인

```typescript
// Request
interface LoginRequest {
  email: string
  password: string
}

// Response
interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string   // "bearer"
  expires_in: number   // 초 단위
}
```

## 작업 목록

### 2.1 타입 정의

`src/types/auth.ts` 파일에 인증 관련 타입을 정의한다.

### 2.2 인증 API 모듈

`src/api/auth.ts` 파일에 인증 API 호출 함수를 구현한다.

```typescript
// 구현할 함수
export function register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>>
export function login(data: LoginRequest): Promise<ApiResponse<TokenResponse>>
export function logout(data?: LogoutRequest): Promise<ApiResponse<MessageResponse>>
export function refreshToken(data: RefreshRequest): Promise<ApiResponse<TokenResponse>>
```

### 2.3 인증 스토어 (Zustand)

`src/stores/authStore.ts`에 인증 상태를 관리한다.

```typescript
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean

  setTokens: (tokens: TokenResponse) => void
  setUser: (user: UserResponse) => void
  clearAuth: () => void
}
```

**토큰 저장소:**
- `access_token`: 메모리 (Zustand) + `localStorage`
- `refresh_token`: `localStorage`

### 2.4 토큰 자동 갱신

`src/api/client.ts`의 ky `afterResponse` 훅에서 401 응답 시 자동으로 토큰을 갱신한다.

**흐름:**
1. API 호출 → 401 Unauthorized 응답
2. `refresh_token`으로 `/api/auth/refresh` 호출
3. 성공 → 새 토큰 저장 후 원래 요청 재시도
4. 실패 → 인증 상태 초기화, 로그인 페이지로 리다이렉트

**동시 요청 처리:**
- 토큰 갱신 중 다른 요청이 401을 받으면, 갱신 완료를 기다린 후 재시도
- Promise queue 패턴 적용

### 2.5 인증 페이지 UI

#### 로그인 페이지 (`/login`)

```
┌─────────────────────────────────────────┐
│                                         │
│              RAG.OS 로고                 │
│                                         │
│    ┌─────────────────────────────┐      │
│    │ 이메일                       │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │ 비밀번호                     │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │         로그인               │      │
│    └─────────────────────────────┘      │
│                                         │
│    계정이 없으신가요? 회원가입            │
│                                         │
└─────────────────────────────────────────┘
```

#### 회원가입 페이지 (`/register`)

```
┌─────────────────────────────────────────┐
│                                         │
│              RAG.OS 로고                 │
│                                         │
│    ┌─────────────────────────────┐      │
│    │ 이름                         │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │ 이메일                       │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │ 비밀번호                     │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │ 비밀번호 확인                 │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │        회원가입               │      │
│    └─────────────────────────────┘      │
│                                         │
│    이미 계정이 있으신가요? 로그인         │
│                                         │
└─────────────────────────────────────────┘
```

**유효성 검증 (Zod):**
- 이메일: 이메일 형식
- 비밀번호: 8자 이상, 대소문자 + 숫자 + 특수문자
- 이름: 2-100자
- 비밀번호 확인: 비밀번호와 일치

### 2.6 라우트 가드

```typescript
// ProtectedRoute: 로그인 필요한 페이지 래핑
// - 비로그인 시 /login으로 리다이렉트
// - 토큰 존재 시 자식 컴포넌트 렌더링

// GuestRoute: 로그인 상태에서 접근 불가
// - 로그인 상태에서 /login, /register 접근 시 /chat으로 리다이렉트
```

### 2.7 앱 초기화 시 인증 복원

앱 로드 시 `localStorage`에서 토큰을 확인하고 유효성을 검증한다.

```
앱 로드 → localStorage에서 토큰 확인
  ├── 토큰 없음 → 비로그인 상태
  └── 토큰 있음 → refresh 호출로 유효성 확인
       ├── 성공 → 로그인 상태 복원
       └── 실패 → 토큰 삭제, 비로그인 상태
```

## 완료 기준

- [ ] 회원가입 → 성공 시 자동 로그인 후 `/chat` 이동
- [ ] 로그인 → 토큰 저장 후 `/chat` 이동
- [ ] 로그아웃 → 토큰 삭제 후 `/login` 이동
- [ ] 401 응답 시 자동 토큰 갱신
- [ ] 갱신 실패 시 로그인 페이지 리다이렉트
- [ ] 폼 유효성 검증 에러 메시지 표시
- [ ] ProtectedRoute / GuestRoute 동작 확인
- [ ] 새로고침 시 인증 상태 유지
