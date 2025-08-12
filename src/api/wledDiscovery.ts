// src/api/wledDiscovery.ts
import { apiClient, handleApiResponse } from "./http";
import { createBoard } from "../domain/wledBoard";
import { WLEDBoard, WLEDStateResponse } from "../types/wled";
import { WLED_DEFAULT_PORT, DEBUG } from "../constants";
import { createLimiter } from "../utils/concurrency";
import axios from "axios";

/**
 * Scans a local network subnet for WLED boards.
 * @param baseIp The base IP address (e.g., "192.168.1.")
 * @param onProgress Callback to report progress.
 * @param signal AbortSignal to cancel the scan.
 * @returns A list of discovered WLED boards.
 */
export async function discoverWLEDBoards(
  baseIp: string,
  onProgress: (progress: { checked: number; found: number }) => void,
  signal?: AbortSignal
): Promise<WLEDBoard[]> {
  const ipsToScan = Array.from({ length: 254 }, (_, i) => `${baseIp}${i + 1}`);
  let checkedCount = 0;
  let foundCount = 0;

  const scanIp = async (ip: string): Promise<WLEDBoard | null> => {
    if (signal?.aborted) return null;

    try {
      const response = await apiClient.get<WLEDStateResponse>(
        `http://${ip}:${WLED_DEFAULT_PORT}/json`,
        { signal }
      );
      if (response.data && response.data.info && response.data.info.name) {
        foundCount++;
        return createBoard({
          ip,
          name: response.data.info.name,
          info: response.data.info,
          state: response.data.state,
        });
      }
      return null;
    } catch (error) {
      if (DEBUG && !axios.isCancel(error)) {
        console.log(`No WLED board at ${ip}`);
      }
      return null;
    } finally {
      if (!signal?.aborted) {
        checkedCount++;
        onProgress({ checked: checkedCount, found: foundCount });
      }
    }
  };

  // Use a concurrency limiter to avoid overwhelming the network
  const limitedScan = createLimiter(24);
  const scanPromises = ipsToScan.map((ip) => limitedScan(() => scanIp(ip)));

  try {
    const results = await Promise.all(scanPromises);
    return results.filter((board): board is WLEDBoard => board !== null);
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Discovery scan was canceled.");
      return [];
    }
    throw error;
  }
}

/**
 * Tests a single IP address to see if it's a WLED board.
 * @param ip The IP address to test.
 * @returns The board if found, otherwise an error response.
 */
export async function testWLEDBoard(ip: string) {
  return handleApiResponse<WLEDBoard>(
    apiClient
      .get<WLEDStateResponse>(`http://${ip}:${WLED_DEFAULT_PORT}/json`)
      .then((response) => {
        if (response.data && response.data.info && response.data.info.name) {
          return {
            ...response,
            data: createBoard({
              ip,
              name: response.data.info.name,
              info: response.data.info,
              state: response.data.state,
            }),
          };
        }
        throw new Error("Not a valid WLED board");
      })
  );
}
