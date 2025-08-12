import React, { useState } from "react";
import { WLEDBoard } from "../types/wled";
import { BoardHeader } from "./board/BoardHeader";
import { BoardControls } from "./board/BoardControls";
import { BoardDetails } from "./board/BoardDetails";
import { Card } from "./ui/Card";

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
  const handleToggle = () => onToggle(board.id, !board.state?.on);
  const handleBrightnessChange = (val: number) =>
    onBrightnessChange(board.id, val);
  return (
    <Card>
      <div className="p-4">
        <BoardHeader
          board={board}
          onRefresh={onRefresh}
          expanded={showDetails}
          onToggleExpand={() => setShowDetails(!showDetails)}
        />
        <BoardControls
          board={board}
          onTogglePower={handleToggle}
          onToggleSync={(t, e) => onToggleSync(board.id, t, e)}
        />
      </div>
      {showDetails && (
        <BoardDetails
          board={board}
          onBrightnessChange={handleBrightnessChange}
        />
      )}
    </Card>
  );
};
