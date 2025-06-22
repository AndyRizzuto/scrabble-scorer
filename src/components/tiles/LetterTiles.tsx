import React from 'react';
import { LETTER_VALUES } from '../../utils/scoring';

interface LetterTilesProps {
  word: string;
  letterMultipliers: number[];
  bingoBonus: boolean;
  tilesUsed: number;
  onLetterMultiplierChange: (index: number) => void;
  onResetAll: () => void;
}

const LetterTiles: React.FC<LetterTilesProps> = ({
  word,
  letterMultipliers,
  bingoBonus,
  tilesUsed,
  onLetterMultiplierChange,
  onResetAll
}) => {
  if (!word) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-blue-800">
          Letter Tiles ({tilesUsed}/7)
          {bingoBonus && <span className="ml-2 text-green-600">🎉 BINGO! +50</span>}
        </h4>
        <button
          onClick={onResetAll}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
        >
          Reset All
        </button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {word.split('').map((letter, index) => {
          const multiplier = letterMultipliers[index] || 1;
          const letterValue = LETTER_VALUES[letter.toUpperCase() as keyof typeof LETTER_VALUES] || 0;
          const adjustedValue = letterValue * multiplier;
          
          return (
            <button
              key={index}
              onClick={() => onLetterMultiplierChange(index)}
              className={`w-16 h-16 rounded-lg border-2 font-bold text-lg transition-all transform hover:scale-105 active:scale-95 ${
                multiplier === 1 
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                  : multiplier === 2 
                  ? 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600'
                  : 'bg-green-500 border-green-600 text-white hover:bg-green-600'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{letter.toUpperCase()}</div>
                <div className="text-xs leading-none">
                  {multiplier === 1 ? letterValue : `${letterValue}×${multiplier}`}
                </div>
                <div className="text-xs font-bold">
                  ={adjustedValue}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-center text-sm text-gray-600">
        Click each letter to cycle: Normal (1x) → Double Letter (2x) → Triple Letter (3x)
      </div>
    </div>
  );
};

export default LetterTiles;

