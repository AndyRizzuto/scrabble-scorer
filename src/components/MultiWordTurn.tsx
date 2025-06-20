import React from 'react';
import { WordEntry } from '../types/game';

interface MultiWordTurnProps {
  currentTurnWords: WordEntry[];
  onRemoveWord: (index: number) => void;
  getTurnTotal: () => number;
}

const MultiWordTurn: React.FC<MultiWordTurnProps> = ({
  currentTurnWords,
  onRemoveWord,
  getTurnTotal
}) => {
  if (currentTurnWords.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-orange-800 mb-2">Multi-Word Turn Mode</h4>
      <p className="text-sm text-orange-700 mb-3">
        Add multiple words for this turn. Each word can have different bonuses.
      </p>
      
      <div className="mb-4">
        <h5 className="font-medium text-gray-700 mb-2">Words in this turn:</h5>
        <div className="space-y-2">
          {currentTurnWords.map((wordEntry, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold">{wordEntry.word}</span>
                <span className="text-sm text-gray-600">
                  Base: {wordEntry.basePoints}
                  {(wordEntry.bonuses.letterMultiplier > 1 || wordEntry.bonuses.wordMultiplier > 1) && 
                    ` → Bonus: ${wordEntry.bonusPoints}`
                  }
                  {wordEntry.bingoBonus && ' (+50 BINGO)'}
                </span>
                <span className="font-semibold text-green-600">+{wordEntry.finalPoints}</span>
              </div>
              <button
                onClick={() => onRemoveWord(index)}
                className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
          <span className="font-semibold text-green-800">
            Turn Total: {getTurnTotal()} points
          </span>
        </div>
      </div>
    </div>
  );
};

export default MultiWordTurn;

