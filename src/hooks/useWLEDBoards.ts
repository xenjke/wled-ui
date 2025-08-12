import { useState, useEffect, useCallback } from 'react';
import { WLEDBoard } from '../types/wled';
import wledApi from '../services/wledApi';

export const useWLEDBoards = () => {
  const [boards, setBoards] = useState<WLEDBoard[]>(() => {
    // Load boards from localStorage on initialization
    const saved = localStorage.getItem('wled-boards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert string dates back to Date objects
        return parsed.map((board: any) => ({
          ...board,
          lastSeen: new Date(board.lastSeen)
        }));
      } catch (e) {
        console.error('Failed to parse saved boards:', e);
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(() => {
    const saved = localStorage.getItem('wled-last-refresh');
    return saved ? new Date(saved) : null;
  });

  // Helper function to save boards to localStorage
  const saveBoardsToStorage = useCallback((newBoards: WLEDBoard[]) => {
    try {
      localStorage.setItem('wled-boards', JSON.stringify(newBoards));
    } catch (e) {
      console.error('Failed to save boards to localStorage:', e);
    }
  }, []);

  // Helper function to save last refresh time
  const saveLastRefreshToStorage = useCallback((date: Date) => {
    try {
      localStorage.setItem('wled-last-refresh', date.toISOString());
    } catch (e) {
      console.error('Failed to save last refresh to localStorage:', e);
    }
  }, []);

  const discoverBoards = useCallback(async (networkRange?: string) => {
    setLoading(true);
    setError(null);
    try {
      const discoveredBoards = await wledApi.discoverBoards(networkRange);
      setBoards(discoveredBoards);
      saveBoardsToStorage(discoveredBoards);
      const refreshTime = new Date();
      setLastRefresh(refreshTime);
      saveLastRefreshToStorage(refreshTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover boards');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBoardStatus = useCallback(async (boardId?: string) => {
    if (boardId) {
      // Refresh specific board
      setBoards(prevBoards => 
        prevBoards.map(board => 
          board.id === boardId 
            ? { ...board, isOnline: false } // Temporarily mark as offline
            : board
        )
      );

      const board = boards.find(b => b.id === boardId);
      if (board) {
        const updatedBoard = await wledApi.refreshBoardStatus(board);
        setBoards(prevBoards => {
          const newBoards = prevBoards.map(b => b.id === boardId ? updatedBoard : b);
          saveBoardsToStorage(newBoards);
          return newBoards;
        });
      }
    } else {
      // Refresh all boards
      setLoading(true);
      try {
        const updatedBoards = await Promise.all(
          boards.map(board => wledApi.refreshBoardStatus(board))
        );
        setBoards(updatedBoards);
        saveBoardsToStorage(updatedBoards);
        const refreshTime = new Date();
        setLastRefresh(refreshTime);
        saveLastRefreshToStorage(refreshTime);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh boards');
      } finally {
        setLoading(false);
      }
    }
  }, [boards]);

  const toggleBoard = useCallback(async (boardId: string, on: boolean) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      const success = await wledApi.toggleBoard(board.ip, board.port, on);
      if (success) {
        // Update local state immediately for better UX
        setBoards(prevBoards => {
          const newBoards = prevBoards.map(b => 
            b.id === boardId 
              ? { ...b, state: { ...b.state, on } as any }
              : b
          );
          saveBoardsToStorage(newBoards);
          return newBoards;
        });
        // Refresh the board to get updated state
        setTimeout(() => refreshBoardStatus(boardId), 100);
      }
    }
  }, [boards, refreshBoardStatus]);

  const setBrightness = useCallback(async (boardId: string, brightness: number) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      const success = await wledApi.setBrightness(board.ip, board.port, brightness);
      if (success) {
        // Update local state immediately for better UX
        setBoards(prevBoards => {
          const newBoards = prevBoards.map(b => 
            b.id === boardId 
              ? { ...b, state: { ...b.state, bri: brightness } as any }
              : b
          );
          saveBoardsToStorage(newBoards);
          return newBoards;
        });
        // Refresh the board to get updated state
        setTimeout(() => refreshBoardStatus(boardId), 100);
      }
    }
  }, [boards, refreshBoardStatus]);

  const toggleSync = useCallback(async (boardId: string, type: 'emit' | 'receive', enabled: boolean) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      const success = await wledApi.toggleSync(board.ip, board.port, type, enabled);
      if (success) {
        // Update local state immediately for better UX
        setBoards(prevBoards => {
          const newBoards = prevBoards.map(b => 
            b.id === boardId 
              ? { 
                  ...b, 
                  syncEmit: type === 'emit' ? enabled : b.syncEmit,
                  syncReceive: type === 'receive' ? enabled : b.syncReceive
                }
              : b
          );
          saveBoardsToStorage(newBoards);
          return newBoards;
        });
        // Refresh the board to get updated state
        setTimeout(() => refreshBoardStatus(boardId), 100);
      }
    }
  }, [boards, refreshBoardStatus]);

  const addBoard = useCallback((board: WLEDBoard) => {
    setBoards(prevBoards => {
      const exists = prevBoards.some(b => b.id === board.id);
      if (!exists) {
        const newBoards = [...prevBoards, board];
        saveBoardsToStorage(newBoards);
        return newBoards;
      }
      return prevBoards;
    });
  }, [saveBoardsToStorage]);

  const removeBoard = useCallback((boardId: string) => {
    setBoards(prevBoards => {
      const newBoards = prevBoards.filter(b => b.id !== boardId);
      saveBoardsToStorage(newBoards);
      return newBoards;
    });
  }, [saveBoardsToStorage]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (boards.length === 0) return;

    const interval = setInterval(() => {
      refreshBoardStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [boards.length, refreshBoardStatus]);

  return {
    boards,
    loading,
    error,
    lastRefresh,
    discoverBoards,
    refreshBoardStatus,
    toggleBoard,
    setBrightness,
    toggleSync,
    addBoard,
    removeBoard
  };
};
