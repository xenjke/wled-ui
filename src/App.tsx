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
    toggleSync,
    addBoard
  } = useWLEDBoards();

  const [showAddModal, setShowAddModal] = useState(false);
  const [networkRange, setNetworkRange] = useState('192.168.4');

  // Auto-discover boards on first load if none exist
  useEffect(() => {
    if (boards.length === 0) {
      // Auto-discover after a short delay
      const timer = setTimeout(() => {
        discoverBoards(networkRange);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [boards.length, networkRange, discoverBoards]);

  const handleDiscover = (range?: string) => {
    const rangeToUse = range || networkRange;
    setNetworkRange(rangeToUse);
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
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Zap className="h-8 w-8 text-yellow-300" />
                <h1 className="text-3xl font-bold">WLED Scanner</h1>
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-green-300" />
                  <span>{onlineBoards.length} online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <WifiOff className="h-4 w-4 text-red-300" />
                  <span>{offlineBoards.length} offline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-800 font-medium">{error}</span>
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

        {/* Boards List - Mobile First Design */}
        {boards.length > 0 ? (
          <div className="space-y-3">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onToggle={toggleBoard}
                onBrightnessChange={setBrightness}
                onRefresh={refreshBoardStatus}
                onToggleSync={toggleSync}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Zap className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No WLED boards found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Use the network discovery tool above to find WLED boards on your network, or add them manually.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
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
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p className="font-medium">WLED Scanner - Monitor and control your WLED boards</p>
            {lastRefresh && (
              <p className="mt-2 text-xs">Last updated: {lastRefresh.toLocaleString()}</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
