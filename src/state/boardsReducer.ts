import { WLEDBoard } from "../types/wled";
import { sortBoards } from "../domain/wledBoard";

export interface BoardsState {
  boards: WLEDBoard[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

export type BoardsAction =
  | { type: "LOAD_SAVED"; boards: WLEDBoard[]; lastRefresh: Date | null }
  | { type: "DISCOVERY_START" }
  | { type: "DISCOVERY_COMPLETE"; boards: WLEDBoard[] }
  | { type: "DISCOVERY_ERROR"; error: string }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_COMPLETE"; boards: WLEDBoard[]; lastRefresh?: Date }
  | { type: "BOARD_UPDATE"; board: WLEDBoard }
  | { type: "ADD_BOARD"; board: WLEDBoard }
  | { type: "REMOVE_BOARD"; id: string }
  | { type: "CLEAR_ERROR" };

export const initialBoardsState: BoardsState = {
  boards: [],
  loading: false,
  error: null,
  lastRefresh: null,
};

export function boardsReducer(
  state: BoardsState,
  action: BoardsAction
): BoardsState {
  switch (action.type) {
    case "LOAD_SAVED":
      return {
        ...state,
        boards: action.boards.sort(sortBoards),
        lastRefresh: action.lastRefresh,
      };
    case "DISCOVERY_START":
      return { ...state, loading: true, error: null };
    case "DISCOVERY_COMPLETE":
      return {
        ...state,
        loading: false,
        boards: action.boards.sort(sortBoards),
        lastRefresh: new Date(),
      };
    case "DISCOVERY_ERROR":
      return { ...state, loading: false, error: action.error };
    case "REFRESH_START":
      return { ...state, loading: true };
    case "REFRESH_COMPLETE":
      return {
        ...state,
        loading: false,
        boards: action.boards.sort(sortBoards),
        lastRefresh: action.lastRefresh || state.lastRefresh,
      };
    case "BOARD_UPDATE":
      return {
        ...state,
        boards: state.boards
          .map((b) => (b.id === action.board.id ? action.board : b))
          .sort(sortBoards),
      };
    case "ADD_BOARD":
      if (state.boards.some((b) => b.id === action.board.id)) return state;
      return {
        ...state,
        boards: [...state.boards, action.board].sort(sortBoards),
      };
    case "REMOVE_BOARD":
      return {
        ...state,
        boards: state.boards.filter((b) => b.id !== action.id),
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}
