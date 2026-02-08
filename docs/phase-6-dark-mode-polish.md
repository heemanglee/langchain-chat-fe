# Phase 6: 다크 모드 + UX 폴리싱

## 목표

라이트/다크 모드를 전역적으로 지원하고, 전체 UX를 개선한다.

## 작업 목록

### 6.1 테마 시스템

#### 테마 스토어 (`src/stores/themeStore.ts`)

```typescript
type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'  // 실제 적용 테마
  setTheme: (theme: Theme) => void
}
```

**동작:**
- `system`: OS 설정 따라가기 (`prefers-color-scheme` media query)
- `light` / `dark`: 수동 설정
- `localStorage`에 설정 저장
- `<html>` 태그에 `dark` 클래스 토글

#### 테마 초기화 (FOUC 방지)

`index.html`의 `<head>`에 인라인 스크립트로 초기 테마를 즉시 적용한다.

```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  })();
</script>
```

#### 테마 토글 버튼

Navbar에 테마 전환 버튼을 배치한다.

```
☀️ → 🌙 → 💻 (light → dark → system 순환)
```

### 6.2 색상 시스템

Tailwind CSS의 `dark:` 접두사를 활용한 색상 매핑이다.

| 요소 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| 배경 (기본) | `bg-zinc-50` | `dark:bg-zinc-950` |
| 배경 (사이드바) | `bg-white` | `dark:bg-zinc-900` |
| 배경 (카드) | `bg-white` | `dark:bg-zinc-800` |
| 텍스트 (기본) | `text-zinc-950` | `dark:text-zinc-50` |
| 텍스트 (보조) | `text-zinc-600` | `dark:text-zinc-400` |
| 보더 | `border-zinc-200` | `dark:border-zinc-700` |
| 입력 필드 배경 | `bg-white` | `dark:bg-zinc-800` |
| 호버 | `hover:bg-zinc-100` | `dark:hover:bg-zinc-800` |
| 코드 블록 | `bg-zinc-100` | `dark:bg-zinc-900` |
| 유저 메시지 배경 | `bg-zinc-100` | `dark:bg-zinc-800` |
| AI 메시지 배경 | `bg-white` | `dark:bg-zinc-900` |

### 6.3 컴포넌트별 다크 모드 적용

다크 모드가 적용되어야 하는 모든 컴포넌트를 점검한다.

#### 우선순위 높음
- [ ] Navbar
- [ ] Sidebar
- [ ] Chat 메시지 (사용자/AI)
- [ ] 메시지 입력 영역
- [ ] 인증 폼 (로그인/회원가입)
- [ ] 모달/다이얼로그

#### 우선순위 중간
- [ ] 문서 라이브러리 카드
- [ ] 폴더 관리 UI
- [ ] 공유 뷰
- [ ] 마크다운 렌더링 (코드 블록, 테이블)
- [ ] 토스트/알림

#### 우선순위 낮음
- [ ] 랜딩 페이지
- [ ] 스크롤바 커스텀 스타일
- [ ] 로딩 스켈레톤

### 6.4 UX 폴리싱

#### 애니메이션 & 트랜지션

- 사이드바 접기/펼치기: `transition-all duration-300`
- 모달 열림/닫힘: fade + scale
- 메시지 등장: fade-in + slide-up
- 스트리밍 커서: 깜빡임 애니메이션
- 버튼 호버: 미묘한 scale 효과
- 페이지 전환: fade

#### 로딩 상태

- 채팅 목록: 스켈레톤 UI
- 문서 업로드: 프로그레스 바
- 메시지 전송: AI 사고 중 (점 3개 애니메이션)
- 페이지 초기 로드: 풀스크린 스피너 또는 스켈레톤

#### 에러 상태

- 네트워크 오류: 재시도 버튼 포함 에러 메시지
- 폼 유효성: 인라인 에러 메시지 (빨간색)
- API 에러: 토스트 알림
- 404 페이지: 커스텀 디자인

#### 빈 상태

- 대화 없음: "새 대화를 시작해보세요" + 시작 버튼
- 문서 없음: "문서를 업로드해보세요" + 업로드 버튼
- 폴더 없음: "폴더를 만들어보세요" + 생성 버튼
- 검색 결과 없음: "일치하는 결과가 없습니다"

#### 반응형 브레이크포인트

```
sm: 640px   → 모바일 (사이드바 오버레이)
md: 768px   → 태블릿
lg: 1024px  → 데스크톱 (사이드바 항상 표시)
xl: 1280px  → 넓은 화면
```

#### 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Ctrl/Cmd + K` | 검색 |
| `Ctrl/Cmd + N` | 새 대화 |
| `Ctrl/Cmd + B` | 사이드바 토글 |
| `Ctrl/Cmd + Shift + L` | 테마 전환 |
| `Escape` | 모달 닫기 |

#### 접근성 (a11y)

- 모든 인터랙티브 요소에 `aria-label`
- 키보드 네비게이션 지원
- 포커스 트랩 (모달)
- 스크린리더 호환 텍스트
- 충분한 색상 대비 (WCAG AA)

### 6.5 성능 최적화

- 코드 스플리팅: `React.lazy()` + `Suspense`
  - 랜딩 페이지
  - 공유 뷰
  - 인증 페이지
- 이미지 최적화: WebP + lazy loading
- 번들 분석: `rollup-plugin-visualizer`
- 메모이제이션: `React.memo`, `useMemo` (메시지 목록 등)

## 완료 기준

- [ ] 라이트/다크/시스템 테마 전환 동작
- [ ] FOUC 없이 초기 테마 적용
- [ ] 모든 컴포넌트 다크 모드 대응
- [ ] 부드러운 애니메이션 및 트랜지션
- [ ] 로딩/에러/빈 상태 처리
- [ ] 반응형 (모바일/태블릿/데스크톱) 동작
- [ ] 키보드 단축키 동작
- [ ] 접근성 기본 요건 충족
- [ ] Lighthouse 성능 점수 90+
