import { useState, useCallback, useEffect } from "react";
import { useWLEDBoards } from "../hooks/useWLEDBoards";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { loadJSON, saveJSON } from "../utils/storage";
import { LOCAL_STORAGE_KEYS } from "../constants";
import { RefreshCw, Wifi } from "lucide-react";

const NetworkRangeInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor="network-range" className="text-sm font-medium">
      Network Base IP:
    </label>
    <input
      id="network-range"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
      placeholder="e.g., 192.168.1."
      pattern="^(\d{1,3}\.){3}$"
      title="Enter the first three octets of an IP, e.g. '192.168.1.'"
      disabled={disabled}
    />
  </div>
);

const ScanStats = ({
  checked,
  total,
  found,
}: {
  checked: number;
  total: number;
  found: number;
}) => (
  <p className="text-sm text-gray-400">
    Scanned: {checked} / {total} | Found: {found}
  </p>
);

export const NetworkDiscovery = () => {
  const { discoverBoards } = useWLEDBoards();
  const [networkRange, setNetworkRange] = useState(() =>
    loadJSON(LOCAL_STORAGE_KEYS.networkRange, "192.168.1.")
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ checked: 0, found: 0 });
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  useEffect(() => {
    saveJSON(LOCAL_STORAGE_KEYS.networkRange, networkRange);
  }, [networkRange]);

  const handleDiscovery = useCallback(async () => {
    setIsScanning(true);
    setScanProgress({ checked: 0, found: 0 });
    const controller = new AbortController();
    setAbortController(controller);

    try {
      await discoverBoards(
        networkRange,
        (progress) => setScanProgress(progress),
        controller.signal
      );
    } catch (error) {
      console.error("Discovery failed:", error);
    } finally {
      setIsScanning(false);
      setAbortController(null);
    }
  }, [discoverBoards, networkRange]);

  const cancelDiscovery = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <Card className="mt-4">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Discover Devices</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <NetworkRangeInput
            value={networkRange}
            onChange={setNetworkRange}
            disabled={isScanning}
          />
          <div className="flex-grow" />
          {isScanning ? (
            <Button onClick={cancelDiscovery} variant="danger">
              Cancel Scan
            </Button>
          ) : (
            <Button
              onClick={handleDiscovery}
              disabled={!networkRange.match(/^(\d{1,3}\.){3}$/)}
              variant="primary"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              {isScanning ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Wifi size={18} />
              )}
              <span>{isScanning ? "Scanning..." : "Scan Network"}</span>
            </Button>
          )}
        </div>
        {isScanning && (
          <div className="mt-4">
            <progress
              className="w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg   [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
              max="254"
              value={scanProgress.checked}
            />
            <ScanStats
              checked={scanProgress.checked}
              total={254}
              found={scanProgress.found}
            />
          </div>
        )}
      </div>
    </Card>
  );
};
