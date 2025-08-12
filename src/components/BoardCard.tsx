import React from "react";
import { WLEDBoard } from "../types/wled";
import { Card } from "./ui/Card";
import { BoardHeader } from "./board/BoardHeader";
import { BoardControls } from "./board/BoardControls";
import { BoardDetails } from "./board/BoardDetails";
import { useWLEDBoards } from "../hooks/useWLEDBoards";

type BoardCardProps = {
  board: WLEDBoard;
};

export const BoardCard = ({ board }: BoardCardProps) => {
  const { removeBoard, togglePower, setBrightness, setSync, refreshAllBoards } =
    useWLEDBoards();

  if (!board) {
    return null;
  }

  return (
    <Card>
      <BoardHeader
        board={board}
        onRemove={() => removeBoard(board.id)}
        onRefresh={refreshAllBoards}
      />
      <BoardControls
        board={board}
        onTogglePower={(on) => togglePower(board.id, on)}
        onSetBrightness={(bri) => setBrightness(board.id, bri)}
        onSetSync={(sync, send) => setSync(board.id, sync, send)}
      />
      <BoardDetails board={board} />
    </Card>
  );
};
