import React from "react";
import { WLEDBoard } from "../../types/wled";
import { WifiOff } from "lucide-react";

interface BoardDetailsProps {
  board: WLEDBoard;
}

export const BoardDetails: React.FC<BoardDetailsProps> = ({ board }) => {
  return (
    <div className="border-t border-gray-100 bg-gray-50 p-5">
      {!board.isOnline && (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-3">
            <WifiOff className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Device Offline
          </h4>
          <p className="text-xs text-gray-500">Check network connection</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <InfoRow
          label="Status"
          value={board.isOnline ? "Online" : "Offline"}
          valueClass={board.isOnline ? "text-green-600" : "text-red-600"}
        />
        <InfoRow label="IP Address" value={board.ip} mono />
        {board.isOnline && board.state && (
          <>
            <InfoRow
              label="Power"
              value={board.state.on ? "On" : "Off"}
              valueClass={board.state.on ? "text-green-600" : "text-gray-600"}
            />
            <InfoRow
              label="Send Sync"
              value={board.syncEmit ? "Enabled" : "Disabled"}
              valueClass={board.syncEmit ? "text-orange-600" : "text-gray-600"}
            />
            <InfoRow
              label="Receive Sync"
              value={board.syncReceive ? "Enabled" : "Disabled"}
              valueClass={board.syncReceive ? "text-cyan-600" : "text-gray-600"}
            />
          </>
        )}
        {board.lastSeen && (
          <InfoRow
            label="Last Seen"
            value={board.lastSeen.toLocaleTimeString()}
          />
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}> = ({ label, value, valueClass = "", mono }) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-700">{label}</span>
    <span className={`${mono ? "font-mono " : ""}font-semibold ${valueClass}`}>
      {value}
    </span>
  </div>
);
