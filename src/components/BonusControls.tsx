import React from 'react';

interface BonusControlsProps {
  bonusMultipliers: {
    letterMultiplier: number;
    wordMultiplier: number;
  };
  letterMultipliers: number[];
  bingoBonus: boolean;
  onWordMultiplierChange: (multiplier: number) => void;
  onResetBonuses: () => void;
}

export const BonusControls: React.FC<BonusControlsProps> = ({
  bonusMultipliers,
  letterMultipliers,
  bingoBonus,
  onWordMultiplierChange,
  onResetBonuses
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Word Multipliers */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Word Bonus</label>
          <div className="flex gap-1">
            <button
              onClick={() => onWordMultiplierChange(1)}
              className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 1 ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              1x
            </button>
            <button
              onClick={() => onWordMultiplierChange(2)}
              className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 2 ? 'bg-red-600 text-white' : 'bg-red-200 hover:bg-red-300'}`}
            >
              DW
            </button>
            <button
              onClick={() => onWordMultiplierChange(3)}
              className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 3 ? 'bg-purple-600 text-white' : 'bg-purple-200 hover:bg-purple-300'}`}
            >
              TW
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Current Bonuses</label>
          <div className="text-xs text-gray-600">
            Word {bonusMultipliers.wordMultiplier}x
            {letterMultipliers.some(m => m > 1) && ', Letter bonuses set'}
            {bingoBonus && ', +50 Bingo'}
          </div>
          <button
            onClick={onResetBonuses}
            className="mt-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};