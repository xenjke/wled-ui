import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);
  const { removeBoard, togglePower, setBrightness, setSync, refreshBoard } =
    useWLEDBoards();

  console.log(`BoardCard - ${board.name}:`, {
    isOnline: board.isOnline,
    expanded: expanded,
    hasState: !!board.state,
    powerState: board.state?.on,
  });

  if (!board) {
    return null;
  }

  return (
    <Card>
      <BoardHeader
        board={board}
        onRemove={() => removeBoard(board.id)}
        onRefresh={() => refreshBoard(board.id)}
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
      />
      {expanded && (
        <>
          <BoardControls
            board={board}
            onTogglePower={(on) => togglePower(board.id, on)}
            onSetBrightness={(bri) => setBrightness(board.id, bri)}
            onSetSync={(receive, send) => setSync(board.id, receive, send)}
          />
          <BoardDetails board={board} />
        </>
      )}
    </Card>
  );
};
