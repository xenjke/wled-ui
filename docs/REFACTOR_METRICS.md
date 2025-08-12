# Refactor Metrics

Baseline snapshot (2025-08-13): 1421 LOC

Current snapshot (after reducer + utilities + partial API refactor + BoardCard split):

| File | LOC |
|------|-----|
| src/App.tsx | 194 |
| src/main.tsx | 10 |
| src/types/wled.ts | 101 |
| src/constants/index.ts | 17 |
| src/utils/storage.ts | 30 |
| src/utils/concurrency.ts | 31 |
| src/state/boardsReducer.ts | 59 |
| src/components/AddBoardModal.tsx | 185 |
| src/components/board/BoardHeader.tsx | 50 |
| src/components/board/BoardControls.tsx | 58 |
| src/components/board/BoardDetails.tsx | 64 |
| src/components/BoardCard.tsx | 32 |
| src/components/NetworkDiscovery.tsx | 181 |
| src/hooks/useWLEDBoards.ts | 115 |
| src/domain/wledBoard.ts | 48 |
| src/services/wledApi.ts | 172 |
| Total | 1347 |

Delta: -74 LOC net from baseline (262 -> 204 across BoardCard suite; further reductions to come with UI primitives & NetworkDiscovery split).

Target total LOC: < 1100

Next reduction focus: split large components & finish API modularization.
