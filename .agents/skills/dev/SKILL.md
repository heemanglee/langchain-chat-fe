---
name: dev
description: "프론트엔드 기능 개발의 전체 파이프라인. Plan(PRD 인터뷰) → TDD → Build-Fix → Code-Review → Verify 5단계 워크플로우."
---

# Frontend Development Pipeline

프론트엔드 기능 개발의 전체 파이프라인을 실행한다.

**기능 설명:** {user_input}

## Pipeline Overview

아래 5단계를 순서대로 실행한다. 각 단계가 완료되어야 다음 단계로 진입한다.

```
Phase 1: PLAN → Phase 2: TDD → Phase 3: BUILD-FIX → Phase 4: CODE-REVIEW → Phase 5: VERIFY
```

## Phase 1: PLAN (PRD 인터뷰 + 계획 수립)

### 1-1. 사용자 인터뷰

아래 카테고리별로 질문한다.

**Round 1 — 기능 범위:**
- 이 기능의 핵심 목적은 무엇인가? (새 기능 추가 / 기존 기능 개선 / 버그 수정 / 리팩토링)
- 기능의 범위는? (단일 페이지 / 여러 페이지 / 공통 컴포넌트 / 전역 기능)

**Round 2 — UI/UX 요구사항:**
- UI 스타일은? (기존 디자인 패턴 따르기 / 새로운 디자인 필요 / 디자인 시스템 문서 참고 / 자유롭게 판단)
- 반응형 지원 범위는? (데스크톱만 / 데스크톱+모바일 / 모든 화면 크기)

**Round 3 — 데이터 및 API:**
- 백엔드 API가 준비되어 있는가? (준비 완료 openapi.json 참조 / 일부만 준비 / 아직 미준비 mock 사용 / 프론트엔드 전용)
- 상태 관리 방식 선호는? (Zustand 전역 / TanStack Query 서버 상태 / useState 로컬 / 자동 판단)

**Round 4 — 우선순위:**
- 추가 고려사항이 있는가? (자유 입력)

### 1-2. PRD 생성

인터뷰 결과를 바탕으로 PRD 문서를 작성한다.

### 1-3. 구현 계획 수립

계획을 수립하고 사용자의 승인을 받는다.

### 1-4. Issue & Branch 생성

계획이 승인되면:
1. GitHub Issue 생성 (`gh issue create`)
2. 브랜치 생성 (`git checkout -b {type}/{issue_number}-{description}`)

## Phase 2: TDD (테스트 주도 개발)

TDD 워크플로우를 실행한다.

1. **RED** — 테스트 먼저 작성, `npm run test`로 실패 확인
2. **GREEN** — 최소한의 코드로 테스트 통과
3. **REFACTOR** — 코드 품질 개선, 테스트 여전히 통과 확인
4. 커버리지 80%+ 검증 (`npm run test:coverage`)

### 완료 조건
- 모든 테스트 통과
- 커버리지 80% 이상
- 린트 에러 없음 (`npm run lint`)

## Phase 3: BUILD-FIX (빌드 검증 및 수정)

1. `npm run build` 실행
2. 빌드 성공 → Phase 4로 진입
3. 빌드 실패 → 에러 분석 → 자동 수정 → 재빌드 (최대 3회)
4. 수정 후 `npm run test`로 regression 확인

### 완료 조건
- 빌드 성공
- 테스트 여전히 통과

## Phase 4: CODE-REVIEW (코드 리뷰)

1. 변경된 파일에 대해 보안 + 품질 리뷰 실행
2. **CRITICAL** 이슈 → 즉시 수정, 재리뷰
3. **HIGH** 이슈 → 수정
4. **MEDIUM** 이슈 → 가능하면 수정

### 완료 조건
- CRITICAL 이슈 0개
- HIGH 이슈 0개
- 수정 후 빌드 + 테스트 재확인

## Phase 5: VERIFY (최종 검증)

1. `npm run build` — 빌드 성공
2. `npx tsc --noEmit` — 타입 에러 없음
3. `npm run lint` — 린트 통과
4. `npm run test:coverage` — 테스트 통과 + 커버리지 80%+
5. 보안 체크 — 하드코딩된 시크릿 없음

### 완료 조건
- 모든 검증 항목 PASS

## Phase 5+: 커밋 및 PR

모든 단계 통과 후:
1. 논리적 단위로 커밋 분리
2. PR 생성
3. PR 본문에 `Closes #이슈번호` 포함
