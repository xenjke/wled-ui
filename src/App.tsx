import { useState } from "react";
import { useWLEDBoards } from "./hooks/useWLEDBoards";
import { NetworkDiscovery } from "./components/NetworkDiscovery";
import { BoardCard } from "./components/BoardCard";
import { AddBoardModal } from "./components/AddBoardModal";
import { Zap } from "lucide-react";

function App() {
  const { boards, lastUpdated, addBoard } = useWLEDBoards();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddBoard = async (ip: string) => {
    const newBoard = await addBoard(ip);
    if (newBoard) {
      setShowAddModal(false);
    } else {
      alert(
        `Failed to add WLED device at ${ip}. Please check the IP and try again.`
      );
    }
  };

  const onlineBoards = boards.filter((board) => board.isOnline);
  const offlineBoards = boards.filter((board) => !board.isOnline);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
              <Zap className="h-8 w-8 text-yellow-300" />
            </div>
            <h1 className="text-3xl font-bold mb-2">WLED UI</h1>
            <p className="text-blue-100 mb-6">
              Discover and control your WLED devices
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{onlineBoards.length} online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>{offlineBoards.length} offline</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Device
          </button>
        </div>

        {/* Network Discovery */}
        <NetworkDiscovery />

        {/* Boards List */}
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-2xl shadow-sm mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-2xl mb-6">
              <Zap className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              No WLED devices found
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Use the scanner above to find devices, or add one manually.
            </p>
          </div>
        )}

        {/* Add Board Modal */}
        <AddBoardModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddBoard={handleAddBoard}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-400">
            <p className="font-medium">WLED UI Refactored</p>
            {lastUpdated && (
              <p className="mt-2 text-xs">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
