---
name: fe-pipeline
description: "프론트엔드 개발 파이프라인. Plan(PRD 인터뷰) → TDD → Build-Fix → Code-Review → Verify 5단계 워크플로우. PRD 생성, 빌드 에러 자동 수정, 품질 검증 포함."
---

# Frontend Development Pipeline

프론트엔드 기능 개발의 전체 라이프사이클을 관리하는 파이프라인 스킬.

## When to Apply

- `/dev` 커맨드가 실행될 때 자동 활성화
- 새로운 기능 구현, 대규모 리팩토링, 복잡한 버그 수정 시
- PRD 기반의 체계적인 개발이 필요할 때

## Pipeline Phases

```
PLAN → TDD → BUILD-FIX → CODE-REVIEW → VERIFY
```

각 Phase는 완료 조건을 충족해야 다음으로 진행된다.

## Phase 1: PRD Interview System

### 질문 체계

4라운드에 걸쳐 요구사항을 수집한다.

#### Round 1: 기능 범위 및 목적

| 질문 | options |
|------|---------|
| 이 기능의 핵심 목적은 무엇인가? | 새 기능 추가, 기존 기능 개선, 버그 수정, 리팩토링 |
| 기능의 범위는? | 단일 페이지, 여러 페이지, 공통 컴포넌트, 전역 기능 |

#### Round 2: UI/UX 요구사항

| 질문 | options |
|------|---------|
| UI 스타일 접근 방식은? | 기존 디자인 패턴 따르기, 새로운 디자인 필요, 디자인 시스템 문서 참고, 자유롭게 판단 |
| 반응형 지원 범위는? | 데스크톱만, 데스크톱+모바일, 모든 화면 크기 |

#### Round 3: 데이터 및 API

| 질문 | options |
|------|---------|
| 백엔드 API 준비 상태는? | 준비 완료 (openapi.json 참조), 일부만 준비, 아직 미준비 (mock 사용), 프론트엔드 전용 (API 불필요) |
| 상태 관리 방식 선호는? | Zustand (전역), TanStack Query (서버 상태), useState (로컬), 자동 판단 |

#### Round 4: 우선순위 및 제약사항

| 질문 | options |
|------|---------|
| 우선순위가 높은 항목은? (복수 선택) | 성능 최적화, 접근성(a11y), 애니메이션/전환 효과, 에러 핸들링 |

### PRD 문서 템플릿

```markdown
# PRD: {기능명}

## 1. 개요
- **목적:** {기능의 핵심 목적}
- **범위:** {영향 범위}
- **우선순위:** {높음/중간/낮음}

## 2. 요구사항

### 기능 요구사항
- [ ] {구체적인 기능 요구사항 1}
- [ ] {구체적인 기능 요구사항 2}

### UI/UX 요구사항
- **스타일:** {디자인 접근 방식}
- **반응형:** {지원 범위}
- **컴포넌트:** {필요한 UI 컴포넌트 목록}

### 데이터 요구사항
- **API:** {API 준비 상태 및 엔드포인트}
- **상태 관리:** {사용할 상태 관리 방식}

## 3. 기술 스펙

### 파일 구조
- 새로 생성: {파일 목록}
- 수정: {파일 목록}

### 의존성
- {필요한 패키지}

## 4. 엣지 케이스
- {엣지 케이스 1}
- {엣지 케이스 2}

## 5. 제약사항
- {기술적 제약}
- {비즈니스 제약}
```

## Phase 2: TDD Workflow

### 프론트엔드 TDD 패턴

#### 컴포넌트 테스트 순서

1. **렌더링 테스트** — 컴포넌트가 올바르게 렌더링되는가
2. **인터랙션 테스트** — 사용자 이벤트에 올바르게 반응하는가
3. **상태 테스트** — 상태 변화가 UI에 반영되는가
4. **에러 테스트** — 에러 상태를 올바르게 표시하는가
5. **접근성 테스트** — ARIA 속성이 올바른가

#### 훅 테스트 순서

1. **초기 상태** — 훅의 초기 반환값이 올바른가
2. **상태 변경** — 액션 호출 시 상태가 변경되는가
3. **비동기 동작** — API 호출 결과가 반영되는가
4. **에러 처리** — 에러 발생 시 올바르게 처리되는가

#### API 모듈 테스트 순서

1. **성공 응답** — 올바른 데이터 반환
2. **에러 응답** — HTTP 에러 코드 처리
3. **네트워크 에러** — 연결 실패 처리
4. **인증 에러** — 401/403 처리

### 테스트 유틸리티

```typescript
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}
```

## Phase 3: Build-Fix Procedures

### 에러 유형별 대응 매트릭스

| 에러 | 우선순위 | 자동 수정 가능 | 접근법 |
|------|----------|---------------|--------|
| TypeScript 타입 에러 | HIGH | Yes | 타입 정의 수정, 제네릭 추가 |
| Import 경로 에러 | HIGH | Yes | 경로 수정, `@/` alias 확인 |
| 미사용 변수 | MEDIUM | Yes | 코드 제거 |
| Vite 번들링 에러 | HIGH | Maybe | 설정 확인, 플러그인 호환성 |
| 의존성 누락 | HIGH | Yes | `npm install` 실행 |
| CSS/Tailwind 에러 | LOW | Yes | 클래스명 수정 |

### 수정 루프

```
빌드 실행 → 실패 → 에러 파싱 → 파일:라인 추출 → 코드 읽기 → 수정 → 재빌드
                                                                ↑         │
                                                                └─────────┘
                                                               (최대 3회)
```

## Phase 4: Code Review Checklist

### 프론트엔드 특화 체크 항목

**보안 (CRITICAL):**
- [ ] XSS 취약점 없음 (`dangerouslySetInnerHTML` 미사용 또는 sanitize)
- [ ] 사용자 입력 검증 (zod schema)
- [ ] 민감 정보 클라이언트 노출 없음
- [ ] API 키/토큰 하드코딩 없음

**품질 (HIGH):**
- [ ] `any` 타입 미사용
- [ ] 컴포넌트 50줄 이하 (함수 기준)
- [ ] prop drilling 3단계 이하
- [ ] `useEffect` 의존성 배열 정확
- [ ] 메모이제이션 적절 (`useMemo`, `useCallback`)

**스타일 (MEDIUM):**
- [ ] 라이트/다크 모드 양쪽 스타일링
- [ ] Tailwind 클래스만 사용 (인라인 스타일 없음)
- [ ] 반응형 브레이크포인트 적용
- [ ] Design System 색상 매핑 준수

## Phase 5: Verification Matrix

| 검증 항목 | 명령어 | PASS 조건 |
|-----------|--------|-----------|
| 빌드 | `npm run build` | exit code 0 |
| 타입 체크 | `npx tsc --noEmit` | exit code 0 |
| 린트 | `npm run lint` | exit code 0 |
| 테스트 | `npm run test` | 모든 테스트 통과 |
| 커버리지 | `npm run test:coverage` | 80%+ |
| 보안 | grep for secrets | 하드코딩된 시크릿 없음 |

## Tech Stack Reference

- **React 19** — function components, hooks
- **TypeScript 5.x** — strict mode
- **Vite** — 번들러, HMR
- **Tailwind CSS 4.x** — utility-first, `dark:` variant
- **shadcn/ui** — Radix UI primitives
- **Zustand** — 클라이언트 상태
- **TanStack Query v5** — 서버 상태
- **ky** — HTTP 클라이언트
- **Vitest** — 단위/통합 테스트
- **@testing-library/react** — 컴포넌트 테스트
- **Playwright** — E2E 테스트
- **zod** — 입력 검증
