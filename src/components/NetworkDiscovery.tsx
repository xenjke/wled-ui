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
  const [networkRange, setNetworkRange] = useState('192.168.1');
  const [testIP, setTestIP] = useState('');
  const [testingIP, setTestingIP] = useState(false);

  const handleDiscover = () => {
    onDiscover(networkRange);
  };

  const handleTestIP = async () => {
    if (!testIP.trim()) return;
    
    setTestingIP(true);
    try {
      await onTestIP(testIP.trim());
    } finally {
      setTestingIP(false);
    }
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Network Discovery</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Wifi size={16} />
          <span>{boardCount} board{boardCount !== 1 ? 's' : ''} found</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="networkRange" className="block text-sm font-medium text-gray-700 mb-2">
            Network Range
          </label>
          <input
            type="text"
            id="networkRange"
            value={networkRange}
            onChange={(e) => setNetworkRange(e.target.value)}
            placeholder="192.168.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Manually</span>
          </button>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleTestIP}
            disabled={!testIP.trim() || testingIP}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
      <div className="mb-4">
        <label htmlFor="testIP" className="block text-sm font-medium text-gray-700 mb-2">
          Test Specific IP Address
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="testIP"
            value={testIP}
            onChange={(e) => setTestIP(e.target.value)}
            placeholder="192.168.4.253"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter a specific IP address to test if it's a WLED device
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Last discovery: {formatLastRefresh()}
        </span>
        <span className="text-xs">
          Scans IP range {networkRange}.1 to {networkRange}.254
        </span>
      </div>
    </div>
  );
};
