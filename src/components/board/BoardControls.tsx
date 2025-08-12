import React from 'react';
import { Power, Send, Download } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { WLEDBoard } from '../../types/wled';

interface BoardControlsProps {
  board: WLEDBoard;
  onTogglePower: () => void;
  onToggleSync: (type: 'emit' | 'receive', enabled: boolean) => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({ board, onTogglePower, onToggleSync }) => {
  if (!board.isOnline) return null;
  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="flex flex-col items-center space-y-1">
        <IconButton onClick={onTogglePower} active={board.state?.on} color="green">
          <Power className="h-6 w-6" />
        </IconButton>
        <span className="text-[10px] font-medium text-gray-600">Power</span>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <IconButton onClick={() => onToggleSync('emit', !board.syncEmit)} active={board.syncEmit} color="orange" title="Send sync">
          <Send className="h-5 w-5" />
        </IconButton>
        <span className="text-[10px] font-medium text-gray-600">Send</span>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <IconButton onClick={() => onToggleSync('receive', !board.syncReceive)} active={board.syncReceive} color="cyan" title="Receive sync">
          <Download className="h-5 w-5" />
        </IconButton>
        <span className="text-[10px] font-medium text-gray-600">Receive</span>
      </div>
    </div>
  );
};
