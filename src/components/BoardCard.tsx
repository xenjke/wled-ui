import React from 'react';
import { WLEDBoard } from '../types/wled';
import { Power, Wifi, WifiOff, Radio, Settings } from 'lucide-react';

interface BoardCardProps {
  board: WLEDBoard;
  onToggle: (boardId: string, on: boolean) => void;
  onBrightnessChange: (boardId: string, brightness: number) => void;
  onRefresh: (boardId: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onToggle,
  onBrightnessChange,
  onRefresh
}) => {
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
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      board.isOnline ? 'border-green-500' : 'border-red-500'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            board.isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRefresh(board.id)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* IP and Status */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-mono">{board.ip}</span>
          {board.port && board.port !== 80 && `:${board.port}`}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
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
              Last seen: {board.lastSeen.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
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

      {/* Controls */}
      {board.isOnline && board.state && (
        <div className="space-y-3">
          {/* Power Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Power</span>
            <button
              onClick={() => onToggle(board.id, !board.state!.on)}
              className={`p-2 rounded-md transition-colors ${
                board.state!.on 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Power size={16} />
            </button>
          </div>

          {/* Brightness Control */}
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
  );
};
