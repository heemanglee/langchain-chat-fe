# /build-fix - Build Error Auto-Fix

프로덕션 빌드를 실행하고, 에러 발생 시 자동으로 분석 및 수정한다.

---

## 실행 절차

### Step 1: 빌드 실행

```bash
npm run build
```

빌드 성공 시 → "빌드 성공" 보고 후 종료.

### Step 2: 에러 분석

빌드 실패 시, 에러 메시지를 분석하여 유형을 분류한다.

| 에러 유형 | 패턴 | 대응 |
|-----------|------|------|
| TypeScript 컴파일 에러 | `TS2xxx`, `Type '...' is not assignable` | 타입 수정, 타입 단언 추가, 타입 정의 업데이트 |
| Import 경로 에러 | `Cannot find module`, `Module not found` | 경로 수정, alias 확인 (`@/`), 파일 존재 여부 확인 |
| 미사용 변수/import | `is declared but never used`, `no-unused-vars` | 미사용 코드 제거 |
| JSX/TSX 에러 | `JSX element type does not have any construct` | 컴포넌트 export 확인, props 타입 수정 |
| 번들러 에러 | `[vite]`, `Rollup` | vite.config.ts 확인, 플러그인 설정 검토 |
| 의존성 에러 | `Could not resolve`, `peer dependency` | `npm install` 재실행, 버전 호환성 확인 |
| CSS/Tailwind 에러 | `Unknown utility`, `@apply` | Tailwind 설정 확인, 클래스명 오타 수정 |

### Step 3: 자동 수정

에러 유형에 따라 수정을 적용한다.

**수정 원칙:**
- 한 번에 하나의 에러 유형만 수정
- 수정 후 관련 테스트가 깨지지 않는지 확인
- `any` 타입으로 에러를 회피하지 않음
- 기존 로직을 변경하지 않고 타입/import만 수정

### Step 4: 재빌드

```bash
npm run build
```

- 성공 → Step 5로 진입
- 실패 → Step 2로 돌아감 (최대 3회 반복)
- 3회 반복 후에도 실패 → 사용자에게 수동 개입 요청

### Step 5: Regression 확인

빌드 성공 후 테스트를 재실행하여 수정이 기존 기능을 깨뜨리지 않았는지 확인한다.

```bash
npm run test
```

- 테스트 통과 → "빌드 수정 완료" 보고
- 테스트 실패 → 실패한 테스트 분석 및 수정

---

## 보고 형식

완료 시 아래 형식으로 보고한다:

```
## Build-Fix 결과

- 빌드 시도: N회
- 수정된 에러: N개
  - [에러 유형]: [파일:라인] — [수정 내용]
- 최종 상태: 성공/실패
- 테스트 상태: 통과/실패 (N/M)
```

---

## 금지 사항

- `// @ts-ignore` 또는 `// @ts-expect-error` 사용 금지 (정당한 사유 없이)
- `as any` 타입 단언 금지
- 에러를 숨기기 위한 코드 삭제 금지
- 테스트를 `.skip`으로 비활성화하여 통과시키기 금지
