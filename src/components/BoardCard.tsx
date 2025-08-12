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

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md ${
      board.isOnline ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
    }`}>
      {/* Compact Header Row */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              board.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRefresh(board.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* IP Address */}
        <p className="text-sm text-gray-600 mb-4 font-mono">
          {board.ip}{board.port && board.port !== 80 && `:${board.port}`}
        </p>

        {/* Compact Controls Row */}
        {board.isOnline && board.state && (
          <div className="flex items-center justify-between mb-4">
            {/* Power Toggle */}
            <button
              onClick={() => onToggle(board.id, !board.state!.on)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                board.state!.on 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
              }`}
            >
              <Power size={16} />
              <span className="text-sm">
                {board.state!.on ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Sync Controls - Compact Design */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleSync(board.id, 'emit', !board.syncEmit)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  board.syncEmit 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                }`}
                title={`SYNC Emit: ${board.syncEmit ? 'ON' : 'OFF'}`}
              >
                <Radio size={14} className={board.syncEmit ? 'text-blue-600' : 'text-gray-500'} />
                <span>Send</span>
                <div className={`w-3 h-3 rounded-full ${board.syncEmit ? 'bg-green-500' : 'bg-red-500'}`} />
              </button>
              <button
                onClick={() => onToggleSync(board.id, 'receive', !board.syncReceive)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  board.syncReceive 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                }`}
                title={`SYNC Receive: ${board.syncReceive ? 'ON' : 'OFF'}`}
              >
                <Radio size={14} className={board.syncReceive ? 'text-blue-600' : 'text-gray-500'} />
                <span>Recv</span>
                <div className={`w-3 h-3 rounded-full ${board.syncReceive ? 'bg-green-500' : 'bg-red-500'}`} />
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
            <span className="text-gray-500 text-xs">
              {board.lastSeen.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          {/* Sync Status Details */}
          <div className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Sync Status Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Radio size={16} className={board.syncEmit ? 'text-blue-600' : 'text-gray-500'} />
                  <span className="text-sm font-medium text-gray-700">Send</span>
                </div>
                <div className={`w-4 h-4 rounded-full mx-auto ${board.syncEmit ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-xs text-gray-600 mt-1">{board.syncEmit ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Radio size={16} className={board.syncReceive ? 'text-blue-600' : 'text-gray-500'} />
                  <span className="text-sm font-medium text-gray-700">Receive</span>
                </div>
                <div className={`w-4 h-4 rounded-full mx-auto ${board.syncReceive ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-xs text-gray-600 mt-1">{board.syncReceive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          {/* Board Info */}
          {board.info && (
            <div className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Board Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono text-gray-800">{board.info.ver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LEDs:</span>
                    <span className="font-semibold text-gray-800">{board.info.leds.count}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-semibold text-gray-800">{formatUptime(board.info.uptime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-semibold text-gray-800">{(board.info.freeheap / 1024).toFixed(1)}KB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brightness Control */}
          {board.isOnline && board.state && (
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">Brightness Control</span>
                <span className="text-sm font-bold text-blue-600">{board.state!.bri}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={board.state!.bri}
                onChange={(e) => onBrightnessChange(board.id, parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Offline Message */}
          {!board.isOnline && (
            <div className="text-center py-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <WifiOff size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Board is offline</p>
              <p className="text-xs text-gray-500 mt-1">Check network connection</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
