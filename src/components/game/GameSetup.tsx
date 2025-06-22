import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SetupData } from '../../types/game';

interface GameSetupProps {
  onSetupSubmit: (data: SetupData) => void;
  onClose?: () => void;
  canClose?: boolean;
}

const GameSetup: React.FC<GameSetupProps> = ({ onSetupSubmit, onClose, canClose = false }) => {
  const [setupData, setSetupData] = useState<SetupData>({
    player1Name: 'Andrew',
    player2Name: 'Carla',
    player1Score: 0,
    player2Score: 0
  });

  const handleSubmit = () => {
    onSetupSubmit({
      player1Name: setupData.player1Name || 'Andrew',
      player2Name: setupData.player2Name || 'Carla',
      player1Score: setupData.player1Score || 0,
      player2Score: setupData.player2Score || 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative">
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-2xl font-bold text-center mb-6">Game Setup</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1 Name
            </label>
            <input
              type="text"
              value={setupData.player1Name}
              onChange={(e) => setSetupData(prev => ({ ...prev, player1Name: e.target.value }))}
              placeholder="Andrew"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1 Starting Score
            </label>
            <input
              type="number"
              value={setupData.player1Score}
              onChange={(e) => setSetupData(prev => ({ ...prev, player1Score: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 2 Name
            </label>
            <input
              type="text"
              value={setupData.player2Name}
              onChange={(e) => setSetupData(prev => ({ ...prev, player2Name: e.target.value }))}
              placeholder="Carla"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 2 Starting Score
            </label>
            <input
              type="number"
              value={setupData.player2Score}
              onChange={(e) => setSetupData(prev => ({ ...prev, player2Score: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;

