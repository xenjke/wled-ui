export interface WLEDInfo {
  ver: string;
  name: string;
  udpport: number;
  live: boolean;
  leds: {
    count: number;
    rgbw: boolean;
    wv: number;
    fps: number;
    maxpwr: number;
    maxseg: number;
  };
  str: boolean;
  wifi: {
    bssid: string;
    rssi: number;
    signal: number;
    channel: number;
  };
  fs: {
    u: number;
    t: number;
    pmt: number;
    lv: number;
    lm: number;
    free: number;
    max: number;
  };
  ndc: number;
  arch: string;
  core: string;
  lwip: number;
  freeheap: number;
  uptime: number;
  opt: number;
  brand: string;
  product: string;
  mac: string;
  ip: string;
}

export interface WLEDState {
  on: boolean;
  bri: number;
  transition: number;
  ps: number;
  pl: number;
  nl: {
    on: boolean;
    dur: number;
    fade: boolean;
    mode: number;
    tbri: number;
    rem: number;
  };
  udpn: {
    send: boolean;
    receive: boolean;
  };
  seg: Array<{
    id: number;
    start: number;
    stop: number;
    len: number;
    grp: number;
    spc: number;
    of: number;
    on: boolean;
    bri: number;
    col: Array<[number, number, number]>;
    fx: number;
    sx: number;
    ix: number;
    pal: number;
    flip: boolean;
    reverse: boolean;
    sel: boolean;
    rev: boolean;
    mi: boolean;
  }>;
}

export interface WLEDBoard {
  id: string;
  name: string;
  ip: string;
  port?: number;
  info?: WLEDInfo;
  state?: WLEDState;
  lastSeen: Date;
  isOnline: boolean;
  syncEmit: boolean;
  syncReceive: boolean;
}

export interface WLEDStateResponse {
  state: WLEDState;
  info: WLEDInfo;
}

export interface WLEDConfig {
  boards: WLEDBoard[];
  refreshInterval: number;
  autoDiscover: boolean;
}
