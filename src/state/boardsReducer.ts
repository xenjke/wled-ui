import { WLEDBoard } from "../types/wled";
import { sortBoards } from "../domain/wledBoard";

export type BoardsAction =
  | { type: "LOAD_BOARDS"; payload: WLEDBoard[] }
  | { type: "ADD_BOARD"; payload: WLEDBoard }
  | { type: "REMOVE_BOARD"; payload: string } // payload is board id
  | { type: "UPDATE_BOARD"; payload: Partial<WLEDBoard> & { id: string } }
  | { type: "SET_ALL_OFFLINE" }
  | { type: "DISCOVERY_COMPLETE"; payload: WLEDBoard[] };

export type BoardsState = {
  boards: WLEDBoard[];
  lastUpdated: number | null;
};

export const initialBoardsState: BoardsState = {
  boards: [],
  lastUpdated: null,
};

export function boardsReducer(
  state: BoardsState,
  action: BoardsAction
): BoardsState {
  switch (action.type) {
    case "LOAD_BOARDS":
      return {
        ...state,
        boards: action.payload.sort(sortBoards),
        lastUpdated: Date.now(),
      };

    case "ADD_BOARD": {
      const existing = state.boards.find((b) => b.id === action.payload.id);
      if (existing) {
        // If board already exists, update it
        return {
          ...state,
          boards: state.boards
            .map((b) =>
              b.id === action.payload.id ? { ...b, ...action.payload } : b
            )
            .sort(sortBoards),
          lastUpdated: Date.now(),
        };
      }
      return {
        ...state,
        boards: [...state.boards, action.payload].sort(sortBoards),
        lastUpdated: Date.now(),
      };
    }

    case "REMOVE_BOARD":
      return {
        ...state,
        boards: state.boards.filter((b) => b.id !== action.payload),
        lastUpdated: Date.now(),
      };

    case "UPDATE_BOARD":
      return {
        ...state,
        boards: state.boards
          .map((b) =>
            b.id === action.payload.id
              ? { ...b, ...action.payload, lastSeen: new Date() }
              : b
          )
          .sort(sortBoards),
        lastUpdated: Date.now(),
      };

    case "SET_ALL_OFFLINE":
      return {
        ...state,
        boards: state.boards.map((b) => ({ ...b, isOnline: false })),
        lastUpdated: Date.now(),
      };

    case "DISCOVERY_COMPLETE": {
      const discoveredBoards = action.payload;

      // Create a map of discovered boards for efficient lookup
      const discoveredMap = new Map(discoveredBoards.map((b) => [b.id, b]));

      // Update existing boards and mark offline if not found in discovery
      const updatedBoards = state.boards.map((board) => {
        const discovered = discoveredMap.get(board.id);
        if (discovered) {
          // Board was found, update it and mark as online
          discoveredMap.delete(board.id); // Remove from map to track new boards
          return {
            ...board,
            ...discovered,
            isOnline: true,
            lastSeen: new Date(),
          };
        } else {
          // Board was not found, mark as offline
          return { ...board, isOnline: false };
        }
      });

      // Add any remaining boards from the discovery (new boards)
      const newBoards = Array.from(discoveredMap.values());

      return {
        ...state,
        boards: [...updatedBoards, ...newBoards].sort(sortBoards),
        lastUpdated: Date.now(),
      };
    }

    default:
      return state;
  }
}
