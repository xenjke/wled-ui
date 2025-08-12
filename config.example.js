// WLED Dashboard Configuration Example
// Copy this file to config.js and modify as needed

export const config = {
  // Development server settings
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  // WLED API settings
  wled: {
    discoveryTimeout: 2000,
    defaultPort: 80,
  },

  // Network discovery settings
  discovery: {
    defaultNetworkRange: "192.168.1",
    autoDiscoveryEnabled: true,
    autoRefreshInterval: 30000,
  },

  // UI settings
  ui: {
    maxBoardsDisplay: 50,
    enableDebugLogging: false,
  },
};
