import React from 'react';

interface SetupModalProps {
  show: boolean;
  setupData: {
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
  };
  onSetupDataChange: (data: Partial<SetupModalProps['setupData']>) => void;
  onSubmit: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  show,
  setupData,
  onSetupDataChange,
  onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Game Setup</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1 Name
            </label>
            <input
              type="text"
              value={setupData.player1Name}
              onChange={(e) => onSetupDataChange({ player1Name: e.target.value })}
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
              onChange={(e) => onSetupDataChange({ player1Score: parseInt(e.target.value) || 0 })}
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
              onChange={(e) => onSetupDataChange({ player2Name: e.target.value })}
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
              onChange={(e) => onSetupDataChange({ player2Score: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onSubmit}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};