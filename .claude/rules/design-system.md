# Design System 규칙

## 색상 시스템

모든 컴포넌트는 라이트/다크 모드를 동시에 지원해야 한다. Tailwind의 `dark:` variant를 사용한다.

### 기본 색상 매핑

```
배경 (페이지):      bg-zinc-50          dark:bg-zinc-950
배경 (사이드바):    bg-white            dark:bg-zinc-900
배경 (카드):        bg-white            dark:bg-zinc-800
배경 (입력 필드):   bg-white            dark:bg-zinc-800
배경 (hover):      hover:bg-zinc-100    dark:hover:bg-zinc-800
배경 (active):     bg-zinc-100         dark:bg-zinc-800
배경 (코드 블록):   bg-zinc-100         dark:bg-zinc-900

텍스트 (기본):      text-zinc-950       dark:text-zinc-50
텍스트 (보조):      text-zinc-600       dark:text-zinc-400
텍스트 (약한):      text-zinc-400       dark:text-zinc-500
텍스트 (강조):      text-black          dark:text-white

보더 (기본):        border-zinc-200     dark:border-zinc-700
보더 (약한):        border-zinc-100     dark:border-zinc-800
보더 (hover):      hover:border-zinc-300 dark:hover:border-zinc-600
```

### 시맨틱 색상

```
성공 (초록):    bg-emerald-50 text-emerald-600    dark:bg-emerald-950 dark:text-emerald-400
경고 (노랑):    bg-yellow-50 text-yellow-800      dark:bg-yellow-950 dark:text-yellow-200
에러 (빨강):    bg-red-50 text-red-600            dark:bg-red-950 dark:text-red-400
정보 (파랑):    bg-blue-50 text-blue-600          dark:bg-blue-950 dark:text-blue-400
처리중 (파랑):  bg-blue-50 text-blue-600          dark:bg-blue-950 dark:text-blue-400
```

### 문서 타입별 색상

```
PDF:    bg-red-50 text-red-500        dark:bg-red-950 dark:text-red-400
DOCX:   bg-blue-50 text-blue-500     dark:bg-blue-950 dark:text-blue-400
TXT:    bg-zinc-50 text-zinc-500     dark:bg-zinc-800 dark:text-zinc-400
MD:     bg-emerald-50 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400
```

## 타이포그래피

### 폰트

- 기본: `Inter` (Google Fonts)
- 코드: `JetBrains Mono` 또는 시스템 monospace

### 크기 체계

```
텍스트 xs:   text-xs     (12px) — 메타데이터, 배지
텍스트 sm:   text-sm     (14px) — 보조 텍스트, 사이드바 항목
텍스트 base: text-base   (16px) — 본문, 메시지
텍스트 lg:   text-lg     (18px) — 섹션 제목
텍스트 xl:   text-xl     (20px) — 페이지 제목
```

### 굵기

```
font-light:    300 — 설명 텍스트
font-normal:   400 — 본문
font-medium:   500 — 강조, 라벨
font-semibold: 600 — 제목, 네비게이션
```

## 아이콘

### Iconify Solar 아이콘셋 사용

```typescript
import { Icon } from '@iconify/react'

// 사용 패턴
<Icon icon="solar:folder-check-linear" width={24} />
<Icon icon="solar:file-text-bold" width={16} />
```

### 주요 아이콘 매핑

```
파일/문서:     solar:file-text-bold
폴더:         solar:folder-with-files-linear
폴더 체크:    solar:folder-check-linear
업로드:       solar:upload-minimalistic-linear
검색:         solar:magnifer-linear
설정:         solar:settings-linear
사용자:       solar:user-circle-linear
채팅:         solar:chat-round-dots-linear
전송:         solar:arrow-right-linear
공유:         solar:share-linear
삭제:         solar:trash-bin-trash-linear
편집:         solar:pen-linear
닫기:         solar:close-circle-linear
체크:         solar:check-circle-bold
경고:         solar:danger-triangle-linear
정보:         solar:info-circle-linear
전구:         solar:lightbulb-bolt-linear
마법봉:       solar:magic-stick-3-bold
재생:         solar:play-circle-linear
방패:         solar:shield-check-linear
시계:         solar:clock-circle-linear
로봇:         solar:robot-bold
라이브러리:    solar:library-linear
해/달:        solar:sun-linear / solar:moon-linear
```

## 레이아웃 컴포넌트 규칙

### Navbar

```
높이: h-14
배경: bg-white/80 backdrop-blur-md dark:bg-zinc-900/80
하단 보더: border-b border-zinc-200 dark:border-zinc-700
z-index: z-50
position: fixed top-0
```

### Sidebar

```
너비: w-[280px] (펼침), w-0 (접힘)
배경: bg-white dark:bg-zinc-900
오른쪽 보더: border-r border-zinc-200 dark:border-zinc-700
transition: transition-all duration-300
모바일: fixed inset-y-0 left-0 z-40 + 오버레이 백드롭
```

### Chat Area

```
flex-1, overflow-y-auto
메시지 최대 너비: max-w-3xl mx-auto
padding: px-4 py-6
```

### 메시지 입력 영역

```
하단 고정: sticky bottom-0
배경: bg-white dark:bg-zinc-900
상단 보더: border-t border-zinc-200 dark:border-zinc-700
padding: p-4
입력 필드: rounded-xl, auto-resize textarea
```

## 컴포넌트 스타일 패턴

### 카드

```html
<div class="p-4 rounded-xl border bg-white border-zinc-200
            dark:bg-zinc-800 dark:border-zinc-700
            hover:border-zinc-300 dark:hover:border-zinc-600
            transition-colors">
```

### 버튼 (Primary)

```html
<button class="h-10 px-4 rounded-lg font-medium text-sm
               bg-zinc-900 text-zinc-50 hover:bg-zinc-800
               dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200
               transition-colors">
```

### 버튼 (Secondary/Ghost)

```html
<button class="h-10 px-4 rounded-lg font-medium text-sm
               text-zinc-600 hover:bg-zinc-100
               dark:text-zinc-400 dark:hover:bg-zinc-800
               transition-colors">
```

### 배지 (상태)

```html
<!-- 성공 -->
<span class="text-xs px-2 py-1 rounded-full font-medium
             bg-emerald-50 text-emerald-600
             dark:bg-emerald-950 dark:text-emerald-400">
  에이전트 생성됨
</span>

<!-- 처리중 -->
<span class="text-xs px-2 py-1 rounded-full font-medium
             bg-blue-50 text-blue-600
             dark:bg-blue-950 dark:text-blue-400">
  처리 중...
</span>
```

### 입력 필드

```html
<input class="h-10 w-full px-3 rounded-lg border text-sm
              bg-white border-zinc-200 text-zinc-950
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-zinc-400
              dark:focus:ring-zinc-500
              transition-colors" />
```

## 모달/다이얼로그

```
오버레이: bg-black/50 backdrop-blur-sm
컨테이너: bg-white dark:bg-zinc-800 rounded-2xl shadow-xl
최대 너비: max-w-md
padding: p-6
애니메이션: fade-in + scale (200ms)
```

## 스크롤바

```css
/* 커스텀 스크롤바 - 라이트 모드 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }

/* 다크 모드 */
.dark ::-webkit-scrollbar-thumb { background: #3f3f46; }
```

## 금지 사항

- `#hex` 색상 직접 사용 금지 → Tailwind 색상 클래스
- `px` 단위 직접 사용 금지 → Tailwind 간격 체계 (`p-4`, `m-2` 등)
- `opacity` 직접 지정 금지 → Tailwind 불투명도 (`bg-black/50` 등)
- 하드코딩 `z-index` 금지 → Tailwind z-index 클래스 (`z-10`, `z-50` 등)
- 컴포넌트 내 `@media` 쿼리 금지 → Tailwind 반응형 접두사 (`sm:`, `md:`, `lg:`)
- `!important` 사용 금지
- 라이트 모드만 스타일링하고 다크 모드를 빠뜨리지 않는다 → 항상 `dark:` variant 포함
