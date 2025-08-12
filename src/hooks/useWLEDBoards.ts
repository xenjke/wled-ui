import { useEffect, useCallback, useReducer } from 'react';
import { WLEDBoard } from '../types/wled';
import wledApi from '../services/wledApi';
import { boardsReducer, initialBoardsState } from '../state/boardsReducer';
import { loadJSON, saveJSON, loadDate, saveDate } from '../utils/storage';
import { LOCAL_STORAGE_KEYS, REFRESH_INTERVAL_MS } from '../constants';

export const useWLEDBoards = () => {
  const [state, dispatch] = useReducer(boardsReducer, initialBoardsState);

  // Load saved on mount
  useEffect(() => {
    const saved = loadJSON<any[]>(LOCAL_STORAGE_KEYS.boards, []);
    const boards: WLEDBoard[] = saved.map((b) => ({ ...b, lastSeen: new Date(b.lastSeen) }));
    const lastRefresh = loadDate(LOCAL_STORAGE_KEYS.lastRefresh);
    dispatch({ type: 'LOAD_SAVED', boards, lastRefresh });
  }, []);

  // Persist boards + lastRefresh when they change
  useEffect(() => {
    saveJSON(LOCAL_STORAGE_KEYS.boards, state.boards);
    if (state.lastRefresh) saveDate(LOCAL_STORAGE_KEYS.lastRefresh, state.lastRefresh);
  }, [state.boards, state.lastRefresh]);

  const discoverBoards = useCallback(async (networkRange?: string) => {
    dispatch({ type: 'DISCOVERY_START' });
    try {
      const discoveredBoards = await wledApi.discoverBoards(networkRange);
      dispatch({ type: 'DISCOVERY_COMPLETE', boards: discoveredBoards });
    } catch (err) {
      dispatch({ type: 'DISCOVERY_ERROR', error: err instanceof Error ? err.message : 'Failed to discover boards' });
    }
  }, []);

  const refreshBoardStatus = useCallback(async (boardId?: string) => {
    if (boardId) {
      const target = state.boards.find((b) => b.id === boardId);
      if (target) {
        const updatedBoard = await wledApi.refreshBoardStatus(target);
        dispatch({ type: 'BOARD_UPDATE', board: updatedBoard });
      }
    } else {
      dispatch({ type: 'REFRESH_START' });
      try {
        const updatedBoards = await Promise.all(state.boards.map((b) => wledApi.refreshBoardStatus(b)));
        dispatch({ type: 'REFRESH_COMPLETE', boards: updatedBoards, lastRefresh: new Date() });
      } catch (err) {
        dispatch({ type: 'DISCOVERY_ERROR', error: err instanceof Error ? err.message : 'Failed to refresh boards' });
      }
    }
  }, [state.boards]);

  const toggleBoard = useCallback(async (boardId: string, on: boolean) => {
    const board = state.boards.find((b) => b.id === boardId);
    if (!board) return;
    const success = await wledApi.toggleBoard(board.ip, board.port, on);
    if (success) {
      dispatch({ type: 'BOARD_UPDATE', board: { ...board, state: { ...board.state, on } as any } });
      setTimeout(() => refreshBoardStatus(boardId), 100);
    }
  }, [state.boards, refreshBoardStatus]);

  const setBrightness = useCallback(async (boardId: string, brightness: number) => {
    const board = state.boards.find((b) => b.id === boardId);
    if (!board) return;
    const success = await wledApi.setBrightness(board.ip, board.port, brightness);
    if (success) {
      dispatch({ type: 'BOARD_UPDATE', board: { ...board, state: { ...board.state, bri: brightness } as any } });
      setTimeout(() => refreshBoardStatus(boardId), 100);
    }
  }, [state.boards, refreshBoardStatus]);

  const toggleSync = useCallback(async (boardId: string, type: 'emit' | 'receive', enabled: boolean) => {
    const board = state.boards.find((b) => b.id === boardId);
    if (!board) return;
    const success = await wledApi.toggleSync(board.ip, board.port, type, enabled);
    if (success) {
      dispatch({ type: 'BOARD_UPDATE', board: {
        ...board,
        syncEmit: type === 'emit' ? enabled : board.syncEmit,
        syncReceive: type === 'receive' ? enabled : board.syncReceive,
        lastSeen: new Date()
      }});
    }
  }, [state.boards]);

  const addBoard = useCallback((board: WLEDBoard) => {
    dispatch({ type: 'ADD_BOARD', board });
  }, []);

  const removeBoard = useCallback((boardId: string) => {
    dispatch({ type: 'REMOVE_BOARD', id: boardId });
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (state.boards.length === 0) return;
    const interval = setInterval(() => { refreshBoardStatus(); }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.boards.length, refreshBoardStatus]);

  return {
    boards: state.boards,
    loading: state.loading,
    error: state.error,
    lastRefresh: state.lastRefresh,
    discoverBoards,
    refreshBoardStatus,
    toggleBoard,
    setBrightness,
    toggleSync,
    addBoard,
    removeBoard,
  };
};
