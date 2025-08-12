import { useState, useEffect, useCallback } from 'react';
import { WLEDBoard } from '../types/wled';
import wledApi from '../services/wledApi';

export const useWLEDBoards = () => {
  const [boards, setBoards] = useState<WLEDBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const discoverBoards = useCallback(async (networkRange?: string) => {
    setLoading(true);
    setError(null);
    try {
      const discoveredBoards = await wledApi.discoverBoards(networkRange);
      setBoards(discoveredBoards);
      setLastRefresh(new Date());
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
        setBoards(prevBoards => 
          prevBoards.map(b => b.id === boardId ? updatedBoard : b)
        );
      }
    } else {
      // Refresh all boards
      setLoading(true);
      try {
        const updatedBoards = await Promise.all(
          boards.map(board => wledApi.refreshBoardStatus(board))
        );
        setBoards(updatedBoards);
        setLastRefresh(new Date());
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
        setBoards(prevBoards => 
          prevBoards.map(b => 
            b.id === boardId 
              ? { ...b, state: { ...b.state, on } as any }
              : b
          )
        );
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
        setBoards(prevBoards => 
          prevBoards.map(b => 
            b.id === boardId 
              ? { ...b, state: { ...b.state, bri: brightness } as any }
              : b
          )
        );
        // Refresh the board to get updated state
        setTimeout(() => refreshBoardStatus(boardId), 100);
      }
    }
  }, [boards, refreshBoardStatus]);

  const addBoard = useCallback((board: WLEDBoard) => {
    setBoards(prevBoards => {
      const exists = prevBoards.some(b => b.id === board.id);
      if (!exists) {
        return [...prevBoards, board];
      }
      return prevBoards;
    });
  }, []);

  const removeBoard = useCallback((boardId: string) => {
    setBoards(prevBoards => prevBoards.filter(b => b.id !== boardId));
  }, []);

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
    addBoard,
    removeBoard
  };
};
