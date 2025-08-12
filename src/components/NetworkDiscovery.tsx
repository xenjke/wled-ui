import React, { useState } from "react";
import { Search, Plus, RefreshCw, Wifi } from "lucide-react";

interface NetworkDiscoveryProps {
  onDiscover: (networkRange?: string) => void;
  onTestIP: (ip: string) => void;
  onAddManual: () => void;
  loading: boolean;
  lastRefresh: Date | null;
  boardCount: number;
}

export const NetworkDiscovery: React.FC<NetworkDiscoveryProps> = ({
  onDiscover,
  onTestIP,
  onAddManual,
  loading,
  lastRefresh,
  boardCount,
}) => {
  const [networkRange, setNetworkRange] = useState(() => {
    const saved = localStorage.getItem("wled-network-range");
    return saved || "192.168.4";
  });
  const [testIP, setTestIP] = useState(() => {
    const saved = localStorage.getItem("wled-test-ip");
    return saved || "";
  });
  const [testingIP, setTestingIP] = useState(false);

  const handleDiscover = () => {
    localStorage.setItem("wled-network-range", networkRange);
    onDiscover(networkRange);
  };

  const handleTestIP = async () => {
    if (!testIP.trim()) return;

    localStorage.setItem("wled-test-ip", testIP.trim());
    setTestingIP(true);
    try {
      await onTestIP(testIP.trim());
    } finally {
      setTestingIP(false);
    }
  };

  const handleNetworkRangeChange = (value: string) => {
    setNetworkRange(value);
    localStorage.setItem("wled-network-range", value);
  };

  const handleTestIPChange = (value: string) => {
    setTestIP(value);
    localStorage.setItem("wled-test-ip", value);
  };

  const formatLastRefresh = () => {
    if (!lastRefresh) return "Never";
    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
          <Wifi size={24} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Device Scanner
        </h2>
        <p className="text-gray-600">
          Discover and manage WLED devices on your network
        </p>
        <div className="inline-flex items-center space-x-2 text-sm bg-gray-50 px-4 py-2 rounded-full mt-4">
          <Wifi size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">
            {boardCount} device{boardCount !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {/* Network Range Input */}
      <div className="max-w-md mx-auto mb-6">
        <label
          htmlFor="networkRange"
          className="block text-sm font-medium text-gray-700 mb-3 text-center"
        >
          Network Range
        </label>
        <input
          type="text"
          id="networkRange"
          value={networkRange}
          onChange={(e) => handleNetworkRangeChange(e.target.value)}
          placeholder="192.168.4"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center font-mono"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
        <button
          onClick={handleDiscover}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200"
        >
          {loading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          <span>{loading ? "Scanning..." : "Scan Network"}</span>
        </button>

        <button
          onClick={onAddManual}
          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200"
        >
          <Plus size={18} />
          <span>Add Device</span>
        </button>
      </div>

      {/* Test Specific IP */}
      <div className="max-w-md mx-auto">
        <label
          htmlFor="testIP"
          className="block text-sm font-medium text-gray-700 mb-3 text-center"
        >
          Test Specific IP Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="testIP"
            value={testIP}
            onChange={(e) => handleTestIPChange(e.target.value)}
            placeholder="192.168.4.253"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-mono"
          />
          <button
            onClick={handleTestIP}
            disabled={!testIP.trim() || testingIP}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200 min-w-[100px]"
          >
            {testingIP ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">
              {testingIP ? "Testing..." : "Test"}
            </span>
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500 text-center">
          Enter a specific IP address to test if it's a WLED device
        </p>
      </div>

      {/* Status Footer */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="font-medium">Last scan: {formatLastRefresh()}</span>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            Range: {networkRange}.1 - {networkRange}.254
          </span>
        </div>
      </div>
    </div>
  );
};
