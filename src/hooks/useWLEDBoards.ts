import { useEffect, useCallback, useReducer } from "react";
import { WLEDBoard } from "../types/wled";
import { boardsReducer, initialBoardsState } from "../state/boardsReducer";
import { loadJSON, saveJSON } from "../utils/storage";
import { LOCAL_STORAGE_KEYS, REFRESH_INTERVAL_MS } from "../constants";
import * as wledDiscovery from "../api/wledDiscovery";
import * as wledCommands from "../api/wledCommands";
import { createBoard } from "../domain/wledBoard";

export const useWLEDBoards = () => {
  const [state, dispatch] = useReducer(boardsReducer, initialBoardsState);

  // Load saved boards on mount
  useEffect(() => {
    const savedBoards = loadJSON<WLEDBoard[]>(LOCAL_STORAGE_KEYS.boards, []);
    const boards = savedBoards.map((b) => ({
      ...b,
      lastSeen: new Date(b.lastSeen),
      isOnline: false, // Assume offline until first refresh
    }));
    dispatch({ type: "LOAD_BOARDS", payload: boards });
  }, []);

  // Persist boards to localStorage whenever they change
  useEffect(() => {
    saveJSON(LOCAL_STORAGE_KEYS.boards, state.boards);
  }, [state.boards]);

  const discoverBoards = useCallback(
    async (
      baseIp: string,
      onProgress: (progress: { checked: number; found: number }) => void,
      signal?: AbortSignal
    ) => {
      const discovered = await wledDiscovery.discoverWLEDBoards(
        baseIp,
        onProgress,
        signal
      );
      if (!signal?.aborted) {
        dispatch({ type: "DISCOVERY_COMPLETE", payload: discovered });
      }
    },
    []
  );

  const refreshAllBoards = useCallback(async () => {
    dispatch({ type: "SET_ALL_OFFLINE" });
    await Promise.all(
      state.boards.map(async (board) => {
        const response = await wledCommands.getBoardState(board.ip);
        dispatch({
          type: "UPDATE_BOARD",
          payload: {
            id: board.id,
            isOnline: response.ok,
            state: response.data?.state,
            info: response.data?.info,
          },
        });
      })
    );
  }, [state.boards]);

  const addBoard = useCallback(async (ip: string) => {
    const response = await wledDiscovery.testWLEDBoard(ip);
    if (response.ok && response.data && response.data.info) {
      const newBoard = createBoard({
        id: response.data.info.mac || ip,
        name: response.data.info.name,
        ip: response.data.ip,
        state: response.data.state,
        info: response.data.info,
      });
      dispatch({ type: "ADD_BOARD", payload: newBoard });
      return newBoard;
    }
    return null;
  }, []);

  const removeBoard = useCallback((boardId: string) => {
    dispatch({ type: "REMOVE_BOARD", payload: boardId });
  }, []);

  const togglePower = useCallback(
    async (boardId: string, on: boolean) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;

      // Optimistic update
      dispatch({
        type: "UPDATE_BOARD",
        payload: { id: boardId, state: { ...board.state, on } as any },
      });

      const response = await wledCommands.setPower(board.ip, on);
      if (!response.ok) {
        // Rollback on failure
        dispatch({
          type: "UPDATE_BOARD",
          payload: { id: boardId, state: board.state },
        });
        // TODO: Show error toast
      }
    },
    [state.boards]
  );

  const setBrightness = useCallback(
    async (boardId: string, bri: number) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;

      // Optimistic update
      dispatch({
        type: "UPDATE_BOARD",
        payload: { id: boardId, state: { ...board.state, bri } as any },
      });

      const response = await wledCommands.setBrightness(board.ip, bri);
      if (!response.ok) {
        // Rollback
        dispatch({
          type: "UPDATE_BOARD",
          payload: { id: boardId, state: board.state },
        });
      }
    },
    [state.boards]
  );

  const setSync = useCallback(
    async (boardId: string, sync: boolean, send: boolean) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return;

      // Optimistic update
      dispatch({
        type: "UPDATE_BOARD",
        payload: { id: boardId, syncEmit: send, syncReceive: sync },
      });

      const response = await wledCommands.setSync(board.ip, sync, send);
      if (!response.ok) {
        // Rollback
        dispatch({
          type: "UPDATE_BOARD",
          payload: {
            id: boardId,
            syncEmit: board.syncEmit,
            syncReceive: board.syncReceive,
          },
        });
      }
    },
    [state.boards]
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (state.boards.length === 0) return;
    const intervalId = setInterval(refreshAllBoards, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [state.boards.length, refreshAllBoards]);

  return {
    boards: state.boards,
    lastUpdated: state.lastUpdated,
    discoverBoards,
    refreshAllBoards,
    addBoard,
    removeBoard,
    togglePower,
    setBrightness,
    setSync,
  };
};
