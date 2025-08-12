import axios from "axios";
import { WLEDInfo, WLEDState, WLEDBoard } from "../types/wled";
import {
  DISCOVERY_TIMEOUT_MS,
  WLED_DEFAULT_PORT,
  DISCOVERY_MAX_IN_FLIGHT,
} from "../constants";
import { createLimiter } from "../utils/concurrency";
import { createBoard, withState, markOffline } from "../domain/wledBoard";

const limiter = createLimiter(DISCOVERY_MAX_IN_FLIGHT);

export class WLEDApiService {
  private static instance: WLEDApiService;

  private constructor() {}

  public static getInstance(): WLEDApiService {
    if (!WLEDApiService.instance) {
      WLEDApiService.instance = new WLEDApiService();
    }
    return WLEDApiService.instance;
  }

  async getBoardInfo(
    ip: string,
    port: number = WLED_DEFAULT_PORT
  ): Promise<WLEDInfo | null> {
    try {
      const response = await axios.get(`http://${ip}:${port}/json/info`, {
        timeout: DISCOVERY_TIMEOUT_MS,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get info from ${ip}:`, error);
      return null;
    }
  }

  async getBoardState(
    ip: string,
    port: number = WLED_DEFAULT_PORT
  ): Promise<WLEDState | null> {
    try {
      const response = await axios.get(`http://${ip}:${port}/json/state`, {
        timeout: DISCOVERY_TIMEOUT_MS,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get state from ${ip}:`, error);
      return null;
    }
  }

  async toggleBoard(
    ip: string,
    port: number = WLED_DEFAULT_PORT,
    on: boolean
  ): Promise<boolean> {
    try {
      await axios.post(`http://${ip}:${port}/json/state`, {
        on: on,
      });
      return true;
    } catch (error) {
      console.error(`Failed to toggle ${ip}:`, error);
      return false;
    }
  }

  async setBrightness(
    ip: string,
    port: number = WLED_DEFAULT_PORT,
    brightness: number
  ): Promise<boolean> {
    try {
      await axios.post(`http://${ip}:${port}/json/state`, {
        bri: Math.max(0, Math.min(255, brightness)),
      });
      return true;
    } catch (error) {
      console.error(`Failed to set brightness for ${ip}:`, error);
      return false;
    }
  }

  async toggleSync(
    ip: string,
    port: number = WLED_DEFAULT_PORT,
    type: "emit" | "receive",
    enabled: boolean
  ): Promise<boolean> {
    try {
      const payload: any = {};
      if (type === "emit") {
        payload.udpn = { send: enabled };
      } else if (type === "receive") {
        payload.udpn = { receive: enabled };
      }

      console.log(`Toggling ${type} sync for ${ip}: ${enabled}`, payload);
      await axios.post(`http://${ip}:${port}/json/state`, payload);
      return true;
    } catch (error) {
      console.error(`Failed to toggle ${type} sync for ${ip}:`, error);
      return false;
    }
  }

  async discoverBoards(networkRange?: string): Promise<WLEDBoard[]> {
    const ranges = networkRange
      ? [networkRange]
      : ["192.168.1", "192.168.4", "192.168.0", "10.0.0", "172.16.0"];
    const results: WLEDBoard[] = [];
    for (const range of ranges) {
      const found = await this.scanNetworkRange(range);
      results.push(...found);
      if (!networkRange) await new Promise((r) => setTimeout(r, 100));
    }
    return results;
  }

  private async scanNetworkRange(networkRange: string): Promise<WLEDBoard[]> {
    const collected: WLEDBoard[] = [];
    const tasks: Promise<void>[] = [];
    for (let i = 1; i <= 254; i++) {
      const ip = `${networkRange}.${i}`;
      tasks.push(
        limiter(() => this.checkForWLEDDevice(ip)).then((board) => {
          if (board) collected.push(board);
        })
      );
    }
    await Promise.allSettled(tasks);
    return collected;
  }

  private async checkForWLEDDevice(ip: string): Promise<WLEDBoard | null> {
    try {
      const info = await this.getBoardInfo(ip);
      if (info) {
        console.log(`Found WLED device at ${ip}: ${info.name} (v${info.ver})`);
        const state = await this.getBoardState(ip);
        return createBoard({
          id: info.mac || ip,
          name: info.name || `WLED-${ip.split(".").pop()}`,
          ip,
          port: WLED_DEFAULT_PORT,
          info,
          state: state || undefined,
        });
      }
    } catch (error) {
      // Device not found or not responding - this is normal for most IPs
      // Only log actual errors, not timeouts
      if (error instanceof Error && !error.message.includes("timeout")) {
        console.error(`Error checking ${ip}:`, error.message);
      }
    }
    return null;
  }

  // Method to test a specific IP address
  async testSpecificIP(
    ip: string,
    port: number = WLED_DEFAULT_PORT
  ): Promise<WLEDBoard | null> {
    console.log(`Testing specific IP: ${ip}:${port}`);
    try {
      const board = await this.checkForWLEDDevice(ip);
      if (board) {
        console.log(`Successfully connected to WLED device at ${ip}`);
        return board;
      } else {
        console.log(`No WLED device found at ${ip}`);
        return null;
      }
    } catch (error) {
      console.error(`Error testing ${ip}:`, error);
      return null;
    }
  }

  async refreshBoardStatus(board: WLEDBoard): Promise<WLEDBoard> {
    try {
      const info = await this.getBoardInfo(board.ip, board.port);
      const state = await this.getBoardState(board.ip, board.port);

      if (info && state) {
        return withState({ ...board, info }, state);
      } else {
        return markOffline(board);
      }
    } catch (error) {
      return markOffline(board);
    }
  }
}

export default WLEDApiService.getInstance();
