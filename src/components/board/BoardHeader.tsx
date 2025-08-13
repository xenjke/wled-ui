import { Wifi, WifiOff, RefreshCw, ChevronDown } from "lucide-react";
import { WLEDBoard } from "../../types/wled";
import React from "react";

interface BoardHeaderProps {
  board: WLEDBoard;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  onRefresh,
  onRemove,
  expanded,
  onToggleExpand,
}) => {
  console.log(`BoardHeader - ${board.name}:`, {
    isOnline: board.isOnline,
    lastSeen: board.lastSeen,
  });

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
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
        <div>
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            {board.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 font-mono">{board.ip}</span>
            <button
              onClick={() => onRefresh(board.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
            <button
              onClick={() => onRemove(board.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Remove"
            >
              ❌
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={onToggleExpand}
        className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        title="Toggle details"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};
