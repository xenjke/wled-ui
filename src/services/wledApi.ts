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

  async discoverBoards(networkRange?: string): Promise<WLEDBoard[]> {
    const boards: WLEDBoard[] = [];
    
    // If a specific network range is provided, scan only that one
    if (networkRange) {
      console.log(`Scanning network range: ${networkRange}.x`);
      const rangeBoards = await this.scanNetworkRange(networkRange);
      boards.push(...rangeBoards);
    } else {
      // Scan common network ranges
      const commonRanges = ['192.168.1', '192.168.4', '192.168.0', '10.0.0', '172.16.0'];
      console.log('Scanning common network ranges:', commonRanges);
      
      for (const range of commonRanges) {
        console.log(`Scanning ${range}.x...`);
        const rangeBoards = await this.scanNetworkRange(range);
        boards.push(...rangeBoards);
        
        // Small delay between ranges to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Discovery complete. Found ${boards.length} WLED boards.`);
    return boards;
  }

  private async scanNetworkRange(networkRange: string): Promise<WLEDBoard[]> {
    const boards: WLEDBoard[] = [];
    const promises: Promise<void>[] = [];

    // Scan IP range 1-254
    for (let i = 1; i <= 254; i++) {
      const ip = `${networkRange}.${i}`;
      const promise = this.checkForWLEDDevice(ip).then(board => {
        if (board) {
          console.log(`Found WLED device at ${ip}: ${board.name}`);
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
      console.log(`Checking ${ip}...`);
      const info = await this.getBoardInfo(ip);
      if (info) {
        console.log(`Found WLED device at ${ip}: ${info.name} (v${info.ver})`);
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
      // Device not found or not responding - this is normal for most IPs
      if (error instanceof Error && error.message.includes('timeout')) {
        // Timeout errors are expected for non-WLED devices
      }
    }
    return null;
  }

  // Method to test a specific IP address
  async testSpecificIP(ip: string, port: number = WLED_PORT): Promise<WLEDBoard | null> {
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
