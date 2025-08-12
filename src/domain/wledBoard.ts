import { WLEDBoard, WLEDInfo, WLEDState } from "../types/wled";
import { WLED_DEFAULT_PORT } from "../constants";

export function createBoard(params: {
  id?: string;
  name: string;
  ip: string;
  port?: number;
  info?: WLEDInfo;
  state?: WLEDState;
}): WLEDBoard {
  return {
    id: params.id || params.ip,
    name: params.name,
    ip: params.ip,
    port: params.port ?? WLED_DEFAULT_PORT,
    info: params.info,
    state: params.state,
    lastSeen: new Date(),
    isOnline: Boolean(params.state),
    syncEmit: Boolean(params.state?.udpn?.send),
    syncReceive: Boolean(params.state?.udpn?.receive),
  };
}

export function updateBoard(
  board: WLEDBoard,
  patch: Partial<WLEDBoard>
): WLEDBoard {
  return { ...board, ...patch };
}

export function withState(
  board: WLEDBoard,
  state: WLEDState | undefined
): WLEDBoard {
  return updateBoard(board, {
    state,
    lastSeen: new Date(),
    isOnline: Boolean(state),
    syncEmit: Boolean(state?.udpn?.send),
    syncReceive: Boolean(state?.udpn?.receive),
  });
}

export function markOffline(board: WLEDBoard): WLEDBoard {
  return updateBoard(board, { isOnline: false, lastSeen: new Date() });
}

export function sortBoards(a: WLEDBoard, b: WLEDBoard) {
  // Online first, then name
  if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
  return a.name.localeCompare(b.name);
}
