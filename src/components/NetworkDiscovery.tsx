import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Wifi } from 'lucide-react';

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
  boardCount
}) => {
  const [networkRange, setNetworkRange] = useState(() => {
    const saved = localStorage.getItem('wled-network-range');
    return saved || '192.168.4';
  });
  const [testIP, setTestIP] = useState(() => {
    const saved = localStorage.getItem('wled-test-ip');
    return saved || '';
  });
  const [testingIP, setTestingIP] = useState(false);

  const handleDiscover = () => {
    localStorage.setItem('wled-network-range', networkRange);
    onDiscover(networkRange);
  };

  const handleTestIP = async () => {
    if (!testIP.trim()) return;
    
    localStorage.setItem('wled-test-ip', testIP.trim());
    setTestingIP(true);
    try {
      await onTestIP(testIP.trim());
    } finally {
      setTestingIP(false);
    }
  };

  const handleNetworkRangeChange = (value: string) => {
    setNetworkRange(value);
    localStorage.setItem('wled-network-range', value);
  };

  const handleTestIPChange = (value: string) => {
    setTestIP(value);
    localStorage.setItem('wled-test-ip', value);
  };

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Wifi size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Scanner Form</h2>
            <p className="text-sm text-gray-600">Discover and manage WLED devices</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-2 rounded-xl">
          <Wifi size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700">{boardCount} board{boardCount !== 1 ? 's' : ''} found</span>
        </div>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="networkRange" className="block text-sm font-semibold text-gray-700 mb-2">
            Network Range
          </label>
          <input
            type="text"
            id="networkRange"
            value={networkRange}
            onChange={(e) => handleNetworkRangeChange(e.target.value)}
            placeholder="192.168.4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span>{loading ? 'Discovering...' : 'Discover Boards'}</span>
          </button>
        </div>

        <div className="flex items-end">
          <button
            onClick={onAddManual}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Manually</span>
          </button>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleTestIP}
            disabled={!testIP.trim() || testingIP}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-sm transition-all duration-200"
          >
            {testingIP ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span>{testingIP ? 'Testing...' : 'Test IP'}</span>
          </button>
        </div>
      </div>

            {/* Test Specific IP */}
      <div className="mb-6">
        <label htmlFor="testIP" className="block text-sm font-semibold text-gray-700 mb-2">
          Test Specific IP Address
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            id="testIP"
            value={testIP}
            onChange={(e) => handleTestIPChange(e.target.value)}
            placeholder="192.168.4.253"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Enter a specific IP address to test if it's a WLED device
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">
        <span className="font-medium">
          Last discovery: {formatLastRefresh()}
        </span>
        <span className="text-xs bg-white px-2 py-1 rounded-lg">
          Scans IP range {networkRange}.1 to {networkRange}.254
        </span>
      </div>
    </div>
  );
};
