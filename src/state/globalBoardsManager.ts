import { WLEDBoard } from "../types/wled";
import { loadJSON, saveJSON } from "../utils/storage";
import { LOCAL_STORAGE_KEYS } from "../constants";

// Global singleton to manage boards state across all hook instances
class GlobalBoardsManager {
  private static instance: GlobalBoardsManager;
  private boards: WLEDBoard[] = [];
  private isLoaded = false;
  private subscribers: Set<(boards: WLEDBoard[]) => void> = new Set();
  private saveTimeoutId: number | null = null;

  private constructor() {}

  static getInstance(): GlobalBoardsManager {
    if (!GlobalBoardsManager.instance) {
      GlobalBoardsManager.instance = new GlobalBoardsManager();
    }
    return GlobalBoardsManager.instance;
  }

  // Load boards from localStorage (only once)
  loadBoards(): WLEDBoard[] {
    if (!this.isLoaded) {
      console.log("[GlobalBoardsManager] Loading boards from localStorage...");
      const savedBoards = loadJSON<WLEDBoard[]>(LOCAL_STORAGE_KEYS.boards, []);
      console.log(
        "[GlobalBoardsManager] Saved boards from localStorage:",
        savedBoards
      );

      this.boards = savedBoards.map((b) => ({
        ...b,
        lastSeen: new Date(b.lastSeen),
        isOnline: false, // Assume offline until first refresh
      }));

      console.log("[GlobalBoardsManager] Processed boards:", this.boards);
      this.isLoaded = true;
      this.notifySubscribers();
    }
    return [...this.boards];
  }

  // Update boards and save to localStorage (debounced)
  updateBoards(boards: WLEDBoard[]): void {
    if (!this.isLoaded) {
      console.log("[GlobalBoardsManager] Skipping update - not loaded yet");
      return;
    }

    this.boards = [...boards];
    this.notifySubscribers();

    // Debounce localStorage saves to prevent race conditions
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    this.saveTimeoutId = window.setTimeout(() => {
      console.log(
        "[GlobalBoardsManager] Saving boards to localStorage:",
        this.boards
      );
      saveJSON(LOCAL_STORAGE_KEYS.boards, this.boards);
      this.saveTimeoutId = null;
    }, 100); // 100ms debounce
  }

  // Get current boards
  getBoards(): WLEDBoard[] {
    return [...this.boards];
  }

  // Subscribe to board changes
  subscribe(callback: (boards: WLEDBoard[]) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback([...this.boards]));
  }

  // Find board by ID
  findBoard(id: string): WLEDBoard | undefined {
    return this.boards.find((board) => board.id === id);
  }

  // Update a specific board
  updateBoard(id: string, updates: Partial<WLEDBoard>): boolean {
    const index = this.boards.findIndex((board) => board.id === id);
    if (index === -1) {
      console.log(`[GlobalBoardsManager] Board with ID "${id}" not found!`);
      console.log(
        "[GlobalBoardsManager] Available boards:",
        this.boards.map((b) => b.id)
      );
      return false;
    }

    this.boards[index] = { ...this.boards[index], ...updates };
    this.notifySubscribers();

    // Debounced save
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    this.saveTimeoutId = window.setTimeout(() => {
      console.log(
        "[GlobalBoardsManager] Saving boards to localStorage after update:",
        this.boards
      );
      saveJSON(LOCAL_STORAGE_KEYS.boards, this.boards);
      this.saveTimeoutId = null;
    }, 100);

    return true;
  }

  // Add a new board
  addBoard(board: WLEDBoard): void {
    const existingIndex = this.boards.findIndex((b) => b.id === board.id);
    if (existingIndex >= 0) {
      this.boards[existingIndex] = board;
    } else {
      this.boards.push(board);
    }
    this.updateBoards(this.boards);
  }

  // Remove a board
  removeBoard(id: string): boolean {
    const index = this.boards.findIndex((board) => board.id === id);
    if (index === -1) {
      return false;
    }

    this.boards.splice(index, 1);
    this.updateBoards(this.boards);
    return true;
  }
}

export const globalBoardsManager = GlobalBoardsManager.getInstance();
