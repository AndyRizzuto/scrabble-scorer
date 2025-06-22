import React from 'react';
import { X } from 'lucide-react';

interface TileDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Standard Scrabble tile distribution
const TILE_DISTRIBUTION = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1,
  K: 1, L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6,
  U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1
};

const TileDistributionModal: React.FC<TileDistributionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const totalTiles = Object.values(TILE_DISTRIBUTION).reduce((sum, count) => sum + count, 0);
  const usedTiles = 14; // Assuming each player starts with 7 tiles
  const remainingTiles = totalTiles - usedTiles;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Scrabble Tile Distribution</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{remainingTiles}</div>
            <div className="text-sm text-gray-600">tiles remaining</div>
            <div className="text-xs text-gray-500 mt-1">
              (Started with {totalTiles}, players have {usedTiles})
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center">
            {Object.entries(TILE_DISTRIBUTION).map(([letter, originalCount]) => {
              // For now, showing original distribution - in a real game you'd track used tiles
              const remaining = originalCount; // This would be calculated based on actual game state
              
              return (
                <div 
                  key={letter}
                  className={`p-2 rounded border ${
                    remaining === 0 ? 'bg-red-50 border-red-200 text-red-400' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="font-bold">{letter}</div>
                  <div className="text-xs">{remaining}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Tap any letter to see its point value and remaining count
          </div>
        </div>
      </div>
    </div>
  );
};

export default TileDistributionModal;