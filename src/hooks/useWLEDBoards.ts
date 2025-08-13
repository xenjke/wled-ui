import { useEffect, useCallback, useReducer, useState } from "react";
import { boardsReducer, initialBoardsState } from "../state/boardsReducer";
import { globalBoardsManager } from "../state/globalBoardsManager";
import * as wledDiscovery from "../api/wledDiscovery";
import * as wledCommands from "../api/wledCommands";
import { createBoard } from "../domain/wledBoard";

export const useWLEDBoards = () => {
  const [state, dispatch] = useReducer(boardsReducer, initialBoardsState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load boards from global manager on mount and subscribe to changes
  useEffect(() => {
    console.log("[useWLEDBoards] Initializing...");

    // Load initial data from global manager
    const initialBoards = globalBoardsManager.loadBoards();
    console.log("[useWLEDBoards] Loaded initial boards:", initialBoards);
    dispatch({ type: "LOAD_BOARDS", payload: initialBoards });
    setIsInitialized(true);

    // Subscribe to board changes from global manager
    const unsubscribe = globalBoardsManager.subscribe((boards) => {
      console.log("[useWLEDBoards] Received boards update:", boards);
      dispatch({ type: "LOAD_BOARDS", payload: boards });
    });

    return unsubscribe;
  }, []);

  // Sync local state changes back to global manager (but only after initialization)
  useEffect(() => {
    if (!isInitialized) {
      console.log("[useWLEDBoards] Skipping global sync - not initialized yet");
      return;
    }

    console.log("[useWLEDBoards] Syncing to global manager:", state.boards);
    globalBoardsManager.updateBoards(state.boards);
  }, [state.boards, isInitialized]);

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

  const refreshBoard = useCallback(async (boardId: string) => {
    const board = globalBoardsManager.findBoard(boardId);
    if (!board) return;

    console.log(`Refreshing board: ${board.name} (${board.ip})`);
    const response = await wledCommands.getBoardFullState(board.ip);

    console.log(`Full state response for ${board.name}:`, response);

    if (response.ok && response.data) {
      // The response.data should contain both state and info
      const stateData = response.data.state || response.data; // Handle both formats
      const infoData = response.data.info;

      console.log(`State data:`, stateData);
      console.log(`Info data:`, infoData);

      globalBoardsManager.updateBoard(board.id, {
        name: infoData?.name || board.name,
        isOnline: true,
        state: stateData,
        info: infoData,
        syncEmit: Boolean(stateData?.udpn?.send),
        syncReceive: Boolean(stateData?.udpn?.receive),
        lastSeen: new Date(),
      });
      console.log(
        `Successfully refreshed board: ${infoData?.name || board.name}`
      );
    } else {
      globalBoardsManager.updateBoard(board.id, {
        isOnline: false,
        lastSeen: new Date(),
      });
      console.log(`Failed to refresh board: ${board.name}`);
    }
  }, []);

  const refreshAllBoards = useCallback(async () => {
    const boards = globalBoardsManager.getBoards();
    console.log(`Refreshing all ${boards.length} boards...`);

    // Set all boards offline first
    boards.forEach((board) => {
      globalBoardsManager.updateBoard(board.id, { isOnline: false });
    });

    await Promise.all(
      boards.map(async (board) => {
        const response = await wledCommands.getBoardFullState(board.ip);
        if (response.ok && response.data) {
          const stateData = response.data.state || response.data;
          const infoData = response.data.info;

          globalBoardsManager.updateBoard(board.id, {
            name: infoData?.name || board.name,
            isOnline: true,
            state: stateData,
            info: infoData,
            syncEmit: Boolean(stateData?.udpn?.send),
            syncReceive: Boolean(stateData?.udpn?.receive),
            lastSeen: new Date(),
          });
        } else {
          globalBoardsManager.updateBoard(board.id, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      })
    );
    console.log("Finished refreshing all boards");
  }, []);

  const addBoard = useCallback(async (ip: string) => {
    console.log(`Adding board for IP: ${ip}`);
    const response = await wledDiscovery.testWLEDBoard(ip);
    console.log("testWLEDBoard response:", response);

    if (response.ok && response.data && response.data.info) {
      const boardId = response.data.info.mac || ip;
      console.log(
        `Creating board with ID: ${boardId} (from mac: ${response.data.info.mac})`
      );

      const newBoard = createBoard({
        id: boardId,
        name: response.data.info.name,
        ip: response.data.ip,
        state: response.data.state,
        info: response.data.info,
      });
      console.log("Created board:", newBoard);

      // Add through global manager instead of dispatch
      globalBoardsManager.addBoard(newBoard);
      console.log("Board added through global manager");
      return newBoard;
    }
    return null;
  }, []);

  const removeBoard = useCallback((boardId: string) => {
    globalBoardsManager.removeBoard(boardId);
  }, []);

  const togglePower = useCallback(async (boardId: string, on: boolean) => {
    console.log(`\n=== TOGGLE POWER START ===`);
    console.log(`Looking for board with ID: "${boardId}"`);

    const board = globalBoardsManager.findBoard(boardId);
    if (!board) {
      console.error(`Board with ID "${boardId}" not found!`);
      console.log(
        "Available boards:",
        globalBoardsManager.getBoards().map((b) => ({ id: b.id, name: b.name }))
      );
      return;
    }

    console.log(
      `Board ${board.name}: Current state.on = ${board.state?.on}, Toggling to = ${on}`
    );

    // TEMPORARILY DISABLE OPTIMISTIC UPDATE TO DEBUG
    console.log(`Skipping optimistic update - sending command directly`);

    const response = await wledCommands.setPower(board.ip, on);
    if (!response.ok) {
      console.error(
        `Failed to toggle power for ${board.name}: ${response.error}`
      );
      // TODO: Show error toast
    } else {
      console.log(
        `Successfully toggled power for ${board.name} to ${on ? "ON" : "OFF"}`
      );
      // Fetch actual state from device to confirm the change
      const stateResponse = await wledCommands.getBoardFullState(board.ip);
      console.log(`Power toggle state response:`, stateResponse);

      if (stateResponse.ok && stateResponse.data) {
        const stateData = stateResponse.data.state || stateResponse.data;
        const infoData = stateResponse.data.info;

        console.log(`Received state from device: on = ${stateData?.on}`);

        // Update through global manager instead of dispatch
        const success = globalBoardsManager.updateBoard(boardId, {
          state: stateData,
          info: infoData,
          isOnline: true,
          syncEmit: Boolean(stateData?.udpn?.send),
          syncReceive: Boolean(stateData?.udpn?.receive),
          lastSeen: new Date(),
        });

        if (success) {
          console.log(
            `Board ${board.name} updated successfully through global manager`
          );
        } else {
          console.error(
            `Failed to update board ${board.name} through global manager`
          );
        }
      }
    }
    console.log(`=== TOGGLE POWER END ===\n`);
  }, []);

  const setBrightness = useCallback(async (boardId: string, bri: number) => {
    const board = globalBoardsManager.findBoard(boardId);
    if (!board) return;

    // Store original state for rollback
    const originalState = board.state;

    // Optimistic update
    globalBoardsManager.updateBoard(boardId, {
      state: { ...board.state, bri } as any,
    });

    const response = await wledCommands.setBrightness(board.ip, bri);
    if (!response.ok) {
      // Rollback
      globalBoardsManager.updateBoard(boardId, {
        state: originalState,
      });
    } else {
      // Fetch actual state from device to confirm the change
      const stateResponse = await wledCommands.getBoardFullState(board.ip);
      if (stateResponse.ok && stateResponse.data) {
        const stateData = stateResponse.data.state || stateResponse.data;
        const infoData = stateResponse.data.info;

        globalBoardsManager.updateBoard(boardId, {
          state: stateData,
          info: infoData,
          isOnline: true,
          syncEmit: Boolean(stateData?.udpn?.send),
          syncReceive: Boolean(stateData?.udpn?.receive),
        });
      }
    }
  }, []);

  const setSync = useCallback(
    async (boardId: string, receive: boolean, send: boolean) => {
      const board = globalBoardsManager.findBoard(boardId);
      if (!board) return;

      // Store original sync state for rollback
      const originalSyncEmit = board.syncEmit;
      const originalSyncReceive = board.syncReceive;

      // Optimistic update
      globalBoardsManager.updateBoard(boardId, {
        syncEmit: send,
        syncReceive: receive,
      });

      const response = await wledCommands.setSync(board.ip, receive, send);
      if (!response.ok) {
        // Rollback
        globalBoardsManager.updateBoard(boardId, {
          syncEmit: originalSyncEmit,
          syncReceive: originalSyncReceive,
        });
      } else {
        // Fetch actual state from device to confirm the change
        const stateResponse = await wledCommands.getBoardFullState(board.ip);
        if (stateResponse.ok && stateResponse.data) {
          const stateData = stateResponse.data.state || stateResponse.data;
          const infoData = stateResponse.data.info;

          globalBoardsManager.updateBoard(boardId, {
            state: stateData,
            info: infoData,
            isOnline: true,
            syncEmit: Boolean(stateData?.udpn?.send),
            syncReceive: Boolean(stateData?.udpn?.receive),
          });
        }
      }
    },
    []
  );

  // Auto-refresh every 30 seconds - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    // Disabled to debug manual refresh issues
    console.log("Auto-refresh is temporarily disabled for debugging");
    return;

    // Commented out for now
    // const boards = globalBoardsManager.getBoards();
    // if (boards.length === 0) return;

    // console.log(`Setting up auto-refresh for ${boards.length} boards`);
    // const intervalId = setInterval(() => {
    //   console.log('Auto-refresh triggered');
    //   refreshAllBoards();
    // }, REFRESH_INTERVAL_MS);

    // return () => {
    //   console.log('Clearing auto-refresh interval');
    //   clearInterval(intervalId);
    // };
  }, []); // No dependencies for now

  return {
    boards: state.boards,
    lastUpdated: state.lastUpdated,
    discoverBoards,
    refreshAllBoards,
    refreshBoard,
    addBoard,
    removeBoard,
    togglePower,
    setBrightness,
    setSync,
  };
};
