export const WLED_DEFAULT_PORT = 80;
export const DISCOVERY_TIMEOUT_MS = 5000; // matches previous constant
export const DISCOVERY_MAX_IN_FLIGHT = 24; // concurrency cap for scanning
export const LOCAL_STORAGE_KEYS = {
  boards: "wled-boards",
  lastRefresh: "wled-last-refresh",
  networkRange: "wled-network-range",
  testIp: "wled-test-ip",
};

export const REFRESH_INTERVAL_MS = 30_000;

export const DEBUG = false; // flip to true for verbose logs

export function debugLog(...args: any[]) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}
