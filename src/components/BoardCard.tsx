import React, { useState } from "react";
import { WLEDBoard } from "../types/wled";
import {
  Power,
  Wifi,
  WifiOff,
  Send,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

interface BoardCardProps {
  board: WLEDBoard;
  onToggle: (boardId: string, on: boolean) => void;
  onBrightnessChange: (boardId: string, brightness: number) => void;
  onRefresh: (boardId: string) => void;
  onToggleSync: (
    boardId: string,
    type: "emit" | "receive",
    enabled: boolean
  ) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onToggle,
  onBrightnessChange,
  onRefresh,
  onToggleSync,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = () => {
    onToggle(board.id, !board.state?.on);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onBrightnessChange(board.id, value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Online Status Icon */}
            <div className="relative">
              {board.isOnline ? (
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Wifi className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                  <WifiOff className="h-5 w-5 text-red-600" />
                </div>
              )}
            </div>

            {/* Board Info */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 leading-tight">
                {board.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 font-mono">
                  {board.ip}
                </span>
                <button
                  onClick={() => onRefresh(board.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Toggle details"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showDetails ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
        {/* Main Controls */}
        {board.isOnline && (
          <div className="flex items-center justify-center space-x-4">
            {/* Power Toggle */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleToggle}
                className={`flex items-center justify-center w-12 h-12 rounded-xl font-medium transition-all duration-200 ${
                  board.state?.on
                    ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Power className="h-6 w-6" />
              </button>
              <span className="text-[10px] font-medium text-gray-600">
                Power
              </span>
            </div>

            {/* Sync Send */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() => onToggleSync(board.id, "emit", !board.syncEmit)}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  board.syncEmit
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200 shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                title="Send sync"
              >
                <Send className="h-5 w-5" />
              </button>
              <span className="text-[10px] font-medium text-gray-600">
                Send
              </span>
            </div>

            {/* Sync Receive */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() =>
                  onToggleSync(board.id, "receive", !board.syncReceive)
                }
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  board.syncReceive
                    ? "bg-cyan-100 text-cyan-600 hover:bg-cyan-200 shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                title="Receive sync"
              >
                <Download className="h-5 w-5" />
              </button>
              <span className="text-[10px] font-medium text-gray-600">
                Receive
              </span>
            </div>
          </div>
        )}

        {/* Offline State */}
        {!board.isOnline && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
              <WifiOff className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              Device Offline
            </h4>
            <p className="text-sm text-gray-500">Check network connection</p>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-gray-100 bg-gray-50 p-5">
          {/* Brightness Control now inside details */}
          {board.isOnline && board.state?.on && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">
                  Brightness
                </label>
                <span className="text-xs font-semibold text-gray-900">
                  {board.state.bri}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="255"
                value={board.state.bri}
                onChange={handleBrightnessChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (board.state.bri / 255) * 100
                  }%, #e5e7eb ${(board.state.bri / 255) * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Status</span>
              <span
                className={`font-semibold ${
                  board.isOnline ? "text-green-600" : "text-red-600"
                }`}
              >
                {board.isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">IP Address</span>
              <span className="text-gray-900 font-mono">{board.ip}</span>
            </div>
            {board.isOnline && board.state && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Power</span>
                  <span
                    className={`font-semibold ${
                      board.state.on ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {board.state.on ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Send Sync</span>
                  <span
                    className={`font-semibold ${
                      board.syncEmit ? "text-orange-600" : "text-gray-600"
                    }`}
                  >
                    {board.syncEmit ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Receive Sync
                  </span>
                  <span
                    className={`font-semibold ${
                      board.syncReceive ? "text-cyan-600" : "text-gray-600"
                    }`}
                  >
                    {board.syncReceive ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </>
            )}
            {board.lastSeen && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Last Seen</span>
                <span className="text-gray-900">
                  {board.lastSeen.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
