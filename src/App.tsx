import { useState, useEffect } from 'react';
import { useWLEDBoards } from './hooks/useWLEDBoards';
import { NetworkDiscovery } from './components/NetworkDiscovery';
import { BoardCard } from './components/BoardCard';
import { AddBoardModal } from './components/AddBoardModal';
import { Zap, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import wledApi from './services/wledApi';

function App() {
  const {
    boards,
    loading,
    error,
    lastRefresh,
    discoverBoards,
    refreshBoardStatus,
    toggleBoard,
    setBrightness,
    addBoard
  } = useWLEDBoards();

  const [showAddModal, setShowAddModal] = useState(false);
  const [networkRange, setNetworkRange] = useState('192.168.4');

  // Auto-discover boards on first load
  useEffect(() => {
    const savedNetworkRange = localStorage.getItem('wled-network-range');
    if (savedNetworkRange) {
      setNetworkRange(savedNetworkRange);
    }
    
    // Auto-discover after a short delay
    const timer = setTimeout(() => {
      discoverBoards(savedNetworkRange || networkRange);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDiscover = (range?: string) => {
    const rangeToUse = range || networkRange;
    setNetworkRange(rangeToUse);
    localStorage.setItem('wled-network-range', rangeToUse);
    discoverBoards(rangeToUse);
  };

  const handleAddBoard = (board: any) => {
    addBoard(board);
    setShowAddModal(false);
  };

  const handleTestIP = async (ip: string) => {
    try {
      const board = await wledApi.testSpecificIP(ip);
      if (board) {
        // Add the discovered board to our list
        addBoard(board);
        // Show success message
        alert(`Successfully found WLED device at ${ip}: ${board.name}`);
      } else {
        alert(`No WLED device found at ${ip}`);
      }
    } catch (error) {
      console.error('Error testing IP:', error);
      alert(`Error testing ${ip}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const onlineBoards = boards.filter(board => board.isOnline);
  const offlineBoards = boards.filter(board => !board.isOnline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">WLED Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span>{onlineBoards.length} online</span>
              </div>
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span>{offlineBoards.length} offline</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Network Discovery */}
        <NetworkDiscovery
          onDiscover={handleDiscover}
          onTestIP={handleTestIP}
          onAddManual={() => setShowAddModal(true)}
          loading={loading}
          lastRefresh={lastRefresh}
          boardCount={boards.length}
        />

        {/* Boards Grid */}
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onToggle={toggleBoard}
                onBrightnessChange={setBrightness}
                onRefresh={refreshBoardStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No WLED boards found</h3>
            <p className="text-gray-500 mb-6">
              Use the network discovery tool above to find WLED boards on your network, or add them manually.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Board Manually
            </button>
          </div>
        )}

        {/* Add Board Modal */}
        <AddBoardModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddBoard}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>WLED Dashboard - Monitor and control your WLED boards</p>
            {lastRefresh && (
              <p className="mt-1">Last updated: {lastRefresh.toLocaleString()}</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
