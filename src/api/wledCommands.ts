// src/api/wledCommands.ts
import { apiClient, handleApiResponse } from "./http";
import { WLEDStateResponse } from "../types/wled";
import { WLED_DEFAULT_PORT } from "../constants";

const buildUrl = (ip: string) => `http://${ip}:${WLED_DEFAULT_PORT}/json/state`;
const buildFullUrl = (ip: string) => `http://${ip}:${WLED_DEFAULT_PORT}/json`;

/**
 * Fetches the latest state from a WLED board.
 * @param ip The IP address of the board.
 * @returns The state only.
 */
export async function getBoardState(ip: string) {
  return handleApiResponse<WLEDStateResponse>(apiClient.get(buildUrl(ip)));
}

/**
 * Fetches the complete state and info from a WLED board.
 * @param ip The IP address of the board.
 * @returns The full state and info response.
 */
export async function getBoardFullState(ip: string) {
  return handleApiResponse<WLEDStateResponse>(apiClient.get(buildFullUrl(ip)));
}

/**
 * Toggles the power of a WLED board.
 * @param ip The IP address of the board.
 * @param isOn The desired power state.
 * @returns The API response.
 */
export async function setPower(ip: string, isOn: boolean) {
  console.log(`Sending power command to ${ip}: ${isOn ? "ON" : "OFF"}`);
  return handleApiResponse(apiClient.post(buildUrl(ip), { on: isOn }));
}

/**
 * Sets the brightness of a WLED board.
 * @param ip The IP address of the board.
 * @param brightness The brightness value (0-255).
 * @returns The API response.
 */
export async function setBrightness(ip: string, brightness: number) {
  return handleApiResponse(apiClient.post(buildUrl(ip), { bri: brightness }));
}

/**
 * Toggles the sync state of a WLED board.
 * @param ip The IP address of the board.
 * @param shouldReceive The desired sync state.
 * @param shouldSend The desired send state.
 * @returns The API response.
 */
export async function setSync(
  ip: string,
  shouldReceive: boolean,
  shouldSend: boolean
) {
  return handleApiResponse(
    apiClient.post(buildUrl(ip), {
      udpn: { send: shouldSend, recv: shouldReceive },
    })
  );
}
