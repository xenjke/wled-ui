import axios from 'axios';
import { WLEDInfo, WLEDState, WLEDBoard } from '../types/wled';

const WLED_PORT = 80;
const DISCOVERY_TIMEOUT = 2000;

export class WLEDApiService {
  private static instance: WLEDApiService;

  private constructor() {}

  public static getInstance(): WLEDApiService {
    if (!WLEDApiService.instance) {
      WLEDApiService.instance = new WLEDApiService();
    }
    return WLEDApiService.instance;
  }

  async getBoardInfo(ip: string, port: number = WLED_PORT): Promise<WLEDInfo | null> {
    try {
      const response = await axios.get(`http://${ip}:${port}/json/info`, {
        timeout: DISCOVERY_TIMEOUT
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get info from ${ip}:`, error);
      return null;
    }
  }

  async getBoardState(ip: string, port: number = WLED_PORT): Promise<WLEDState | null> {
    try {
      const response = await axios.get(`http://${ip}:${port}/json/state`, {
        timeout: DISCOVERY_TIMEOUT
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get state from ${ip}:`, error);
      return null;
    }
    }

  async toggleBoard(ip: string, port: number = WLED_PORT, on: boolean): Promise<boolean> {
    try {
      await axios.post(`http://${ip}:${port}/json/state`, {
        on: on
      });
      return true;
    } catch (error) {
      console.error(`Failed to toggle ${ip}:`, error);
      return false;
    }
  }

  async setBrightness(ip: string, port: number = WLED_PORT, brightness: number): Promise<boolean> {
    try {
      await axios.post(`http://${ip}:${port}/json/state`, {
        bri: Math.max(0, Math.min(255, brightness))
      });
      return true;
    } catch (error) {
      console.error(`Failed to set brightness for ${ip}:`, error);
      return false;
    }
  }

  async discoverBoards(networkRange: string = '192.168.1'): Promise<WLEDBoard[]> {
    const boards: WLEDBoard[] = [];
    const promises: Promise<void>[] = [];

    // Scan common IP ranges for WLED devices
    for (let i = 1; i <= 254; i++) {
      const ip = `${networkRange}.${i}`;
      const promise = this.checkForWLEDDevice(ip).then(board => {
        if (board) {
          boards.push(board);
        }
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);
    return boards;
  }

  private async checkForWLEDDevice(ip: string): Promise<WLEDBoard | null> {
    try {
      const info = await this.getBoardInfo(ip);
      if (info) {
        const state = await this.getBoardState(ip);
        return {
          id: info.mac || ip,
          name: info.name || `WLED-${ip.split('.').pop()}`,
          ip,
          port: WLED_PORT,
          info,
          state: state || undefined,
          lastSeen: new Date(),
          isOnline: true,
          syncEmit: state?.udpn?.send || false,
          syncReceive: state?.udpn?.receive || false
        };
      }
    } catch (error) {
      // Device not found or not responding
    }
    return null;
  }

  async refreshBoardStatus(board: WLEDBoard): Promise<WLEDBoard> {
    try {
      const info = await this.getBoardInfo(board.ip, board.port);
      const state = await this.getBoardState(board.ip, board.port);
      
      if (info && state) {
        return {
          ...board,
          info,
          state,
          lastSeen: new Date(),
          isOnline: true,
          syncEmit: state.udpn?.send || false,
          syncReceive: state.udpn?.receive || false
        };
      } else {
        return {
          ...board,
          isOnline: false,
          lastSeen: new Date()
        };
      }
    } catch (error) {
      return {
        ...board,
        isOnline: false,
        lastSeen: new Date()
      };
    }
  }
}

export default WLEDApiService.getInstance();
