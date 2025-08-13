import React from "react";
import { WLEDBoard } from "../../types/wled";
import { Slider } from "../ui/Slider";
import { Button } from "../ui/Button";

interface BoardControlsProps {
  board: WLEDBoard;
  onTogglePower: (isOn: boolean) => void;
  onSetBrightness: (brightness: number) => void;
  onSetSync: (receive: boolean, send: boolean) => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  board,
  onTogglePower,
  onSetBrightness,
  onSetSync,
}) => {
  if (!board.isOnline) return null;

  console.log(`BoardControls - ${board.name}:`, {
    isOnline: board.isOnline,
    powerState: board.state?.on,
    brightness: board.state?.bri,
    syncEmit: board.syncEmit,
    syncReceive: board.syncReceive,
  });

  const handleBrightnessChange = (value: number) => {
    console.log(
      `Brightness changed to: ${value}, Device currently: ${
        board.state?.on ? "ON" : "OFF"
      }`
    );
    onSetBrightness(value);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">Power</span>
        <Button
          onClick={() => {
            console.log(
              `Power button clicked - Current state: ${
                board.state?.on
              }, Toggling to: ${!board.state?.on}`
            );
            onTogglePower(!board.state?.on);
          }}
          variant={board.state?.on ? "primary" : "secondary"}
        >
          {board.state?.on ? "On" : "Off"}
        </Button>
      </div>
      <div className="space-y-2">
        <label htmlFor={`brightness-${board.id}`} className="font-medium">
          Brightness
        </label>
        <Slider
          id={`brightness-${board.id}`}
          min={0}
          max={255}
          step={1}
          value={board.state?.bri ?? 0}
          onChange={handleBrightnessChange}
          disabled={!board.state?.on}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium">Sync</span>
        <div className="flex gap-2">
          <Button
            onClick={() => onSetSync(!board.syncReceive, board.syncEmit)}
            variant={board.syncReceive ? "primary" : "secondary"}
          >
            Receive
          </Button>
          <Button
            onClick={() => onSetSync(board.syncReceive, !board.syncEmit)}
            variant={board.syncEmit ? "primary" : "secondary"}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
