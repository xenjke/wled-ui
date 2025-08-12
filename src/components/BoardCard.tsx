import React, { useState } from 'react';
import { WLEDBoard } from '../types/wled';
import { Power, Wifi, WifiOff, Radio, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface BoardCardProps {
  board: WLEDBoard;
  onToggle: (boardId: string, on: boolean) => void;
  onBrightnessChange: (boardId: string, brightness: number) => void;
  onRefresh: (boardId: string) => void;
  onToggleSync: (boardId: string, type: 'emit' | 'receive', enabled: boolean) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onToggle,
  onBrightnessChange,
  onRefresh,
  onToggleSync
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-500' : 'text-red-500';
  };

  const getSyncStatusColor = (syncEmit: boolean, syncReceive: boolean) => {
    if (syncEmit && syncReceive) return 'text-blue-500';
    if (syncEmit || syncReceive) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-200 ${
      board.isOnline ? 'border-green-500' : 'border-red-500'
    }`}>
      {/* Minimal Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              board.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRefresh(board.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title="Refresh"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* IP Address */}
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-mono">{board.ip}</span>
          {board.port && board.port !== 80 && `:${board.port}`}
        </p>

        {/* Essential Controls - Always Visible */}
        {board.isOnline && board.state && (
          <div className="flex items-center justify-between mb-3">
            {/* Power Toggle */}
            <button
              onClick={() => onToggle(board.id, !board.state!.on)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                board.state!.on 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Power size={16} />
              <span className="text-sm font-medium">
                {board.state!.on ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Sync Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleSync(board.id, 'emit', !board.syncEmit)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  board.syncEmit 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                title={`SYNC Emit: ${board.syncEmit ? 'ON' : 'OFF'}`}
              >
                <Radio size={14} className={board.syncEmit ? 'text-blue-600' : 'text-gray-500'} />
                <span>Emit</span>
                <div className={`w-2 h-2 rounded-full ${board.syncEmit ? 'bg-blue-500' : 'bg-gray-400'}`} />
              </button>
              <button
                onClick={() => onToggleSync(board.id, 'receive', !board.syncReceive)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  board.syncReceive 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                title={`SYNC Receive: ${board.syncReceive ? 'ON' : 'OFF'}`}
              >
                <Radio size={14} className={board.syncReceive ? 'text-blue-600' : 'text-gray-500'} />
                <span>Recv</span>
                <div className={`w-2 h-2 rounded-full ${board.syncReceive ? 'bg-blue-500' : 'bg-gray-400'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {board.isOnline ? (
              <Wifi size={14} className="text-green-500" />
            ) : (
              <WifiOff size={14} className="text-red-500" />
            )}
            <span className={getStatusColor(board.isOnline)}>
              {board.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {board.lastSeen && (
            <span className="text-gray-500">
              {board.lastSeen.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Sync Status Details */}
          <div className="mb-4 p-3 bg-white rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sync Status</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Radio 
                  size={16} 
                  className={getSyncStatusColor(board.syncEmit, board.syncReceive)} 
                />
                <span className={`text-sm ${getSyncStatusColor(board.syncEmit, board.syncReceive)}`}>
                  Emit: {board.syncEmit ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Radio 
                  size={16} 
                  className={getSyncStatusColor(board.syncEmit, board.syncReceive)} 
                />
                <span className={`text-sm ${getSyncStatusColor(board.syncEmit, board.syncReceive)}`}>
                  Receive: {board.syncReceive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          {/* Board Info */}
          {board.info && (
            <div className="mb-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono">{board.info.ver}</span>
              </div>
              <div className="flex justify-between">
                <span>LEDs:</span>
                <span>{board.info.leds.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{formatUptime(board.info.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Free Memory:</span>
                <span>{(board.info.freeheap / 1024).toFixed(1)}KB</span>
              </div>
            </div>
          )}

          {/* Brightness Control */}
          {board.isOnline && board.state && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Brightness</span>
                <span className="text-sm text-gray-500">{board.state!.bri}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={board.state!.bri}
                onChange={(e) => onBrightnessChange(board.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Offline Message */}
          {!board.isOnline && (
            <div className="text-center py-4">
              <WifiOff size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Board is offline</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
