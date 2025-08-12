# WLED UI Refactor Plan

Date started: 2025-08-13

## 🎯 Goals (Quantifiable)
- Cap any single source file at ≤150 lines (stretch ≤120) for core UI & logic.
- Reduce total src TS/TSX LOC from 1421 → <1100 without loss of features.
- Eliminate repeated localStorage logic (currently duplicated in multiple places).
- Centralize board state update logic (remove scattered inline mutations).
- Add lightweight tests around API layer + state logic.
- Improve network scan efficiency (avoid firing 254 unthrottled parallel requests).
- Make UI components more composable (Button, Card, IconButton, Modal, Slider).
- Enable future features (effects, grouping) with clearer domain separation.

## ✅ High-Level Refactor Checklist
(Empty boxes = pending; will be ticked as completed.)

### 1. Baseline & Metrics
- [x] Snapshot current LOC & file complexity (documented in metrics file)
- [x] Create `docs/REFACTOR_METRICS.md` to log before/after stats

### 2. Project Structure & Domain Layer
- [x] Add `src/domain/wledBoard.ts` (factory, normalization, helper updaters)
- [x] Add `src/utils/storage.ts` (typed safe get/set with JSON + namespacing)
- [x] Add `src/constants/index.ts` (ports, timeouts, defaults)

### 3. API Layer Improvements
- [ ] Refactor `wledApi.ts` into smaller modules: `api/http.ts`, `api/wledDiscovery.ts`, `api/wledCommands.ts` (in progress, partial refactor inside single file)
- [x] Add concurrency limiter (e.g., simple in-house queue) for discovery (default max ~24 in-flight)
- [ ] Add abort capability for scans (AbortController pattern)
- [ ] Add unified response type `{ ok: boolean; data?: T; error?: string }`
- [ ] Remove repeated console.error noise; use debug flag

### 4. State Management (`useWLEDBoards`)
- [x] Switch from multiple `setBoards` calls to a `useReducer` with action types
- [ ] Extract repetitive "find + update board" into helper (partial inline, will extract)
- [ ] Add optimistic update pattern utilities
- [x] Isolate persistence side-effects inside a single `useEffect` (serialize on change)
- [ ] Add derived selectors (onlineBoards, offlineBoards) outside component for reuse

### 5. UI Component Decomposition
- [x] Create `components/ui/{Button,IconButton,Card,Modal,Slider}` (Badge pending)
- [x] Refactor `BoardCard` into: `BoardHeader`, `BoardControls`, `BoardDetails` (StatusIcon TBD)
- [ ] Refactor `NetworkDiscovery` into smaller pieces (`NetworkRangeInput`, `TestIPForm`, `ScanStats`)
- [x] Refactor `AddBoardModal` to use shared `Modal` + form field components
- [ ] Add lazy/dynamic import for `AddBoardModal` (code-split)

### 6. Styling & Consistency
- [ ] Extract repeated Tailwind class clusters into small variants (utility functions or cVA-like pattern)
- [ ] Add focus/aria attributes for accessibility
- [ ] Remove inline styles in `App.tsx` footer; use utility classes only

### 7. Performance & UX
- [ ] Debounce brightness slider updates (send on stop or throttle)
- [ ] Batch refresh calls instead of per-action immediate fetch
- [ ] Add scan progress indicator (IPs checked / 254)
- [ ] Skip re-scanning ranges already scanned within recent window (cache layer)

### 8. Error & Loading Handling
- [ ] Add `<ErrorBoundary />` (React 18 pattern)
- [ ] Centralize error messages (enum/map) for reuse
- [ ] Replace alert() in `handleTestIP` with toast system (non-blocking) or inline message component

### 9. Testing (Introduce Vitest)
- [ ] Add `vitest` + config + `@testing-library/react`
- [ ] Unit test: board factory & state reducer
- [ ] Unit test: discovery throttling logic
- [ ] Unit test: brightness optimistic update rollback on failure
- [ ] Mock axios in tests with lightweight manual mock

### 10. Tooling & DX
- [ ] Add `lint-staged` + `prettier` (if not already) for consistency
- [ ] Add `analyze` script (esbuild or rollup-plugin-visualizer) to inspect bundle
- [ ] Add TypeScript path aliases (`@api`, `@domain`, etc.)

### 11. Documentation
- [ ] Update `README.md` with architecture overview & diagrams
- [ ] Add `docs/ARCHITECTURE.md` (layers: UI, state, domain, API)
- [ ] Add contribution guide section (naming, file size targets)

### 12. Metrics & Cleanup
- [ ] Capture post-refactor LOC + bundle size
- [ ] Mark tasks complete & summarize deltas
- [ ] Identify any deferred items / future enhancements (web worker scanning, websocket live updates)

### 13. Optional Stretch
- [ ] Introduce Web Worker for network scan to avoid blocking main thread
- [ ] Add service abstraction for future websockets or SSE
- [ ] Light theme toggling support

## Design Notes
Reducer Actions (draft): LOAD_SAVED, DISCOVERY_COMPLETE, BOARD_UPDATED, TOGGLE_POWER_OPTIMISTIC, TOGGLE_SYNC_OPTIMISTIC, BRIGHTNESS_OPTIMISTIC, REFRESH_STARTED, REFRESH_COMPLETE, ADD_BOARD, REMOVE_BOARD.

Optimistic updates will store a shadow previous state for potential rollback.

Concurrency limiter: simple queue with N workers; avoids extra dependencies.

## Success Criteria
- No behavioral regression (manual smoke: discover → toggle → brightness → sync flags)
- All unit tests green.
- Largest file <150 lines (except types file).
- Discovery no longer spikes 254 parallel requests.
- All localStorage access centralized.
