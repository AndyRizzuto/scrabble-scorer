import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { ValidationResult, BonusMultipliers } from '../types/game';
import { validateWord as validateWordUtil, calculateWordValue, calculateBonusPoints } from '../utils/scoring';
import LetterTiles from './tiles/LetterTiles';

interface WordInputProps {
  word: string;
  points: string;
  letterMultipliers: number[];
  bonusMultipliers: BonusMultipliers;
  bingoBonus: boolean;
  tilesUsed: number;
  onWordChange: (word: string) => void;
  onPointsChange: (points: string) => void;
  onLetterMultiplierChange: (index: number) => void;
  onBonusMultiplierChange: (multipliers: BonusMultipliers) => void;
  onResetBonuses: () => void;
}

const WordInput: React.FC<WordInputProps> = ({
  word,
  points,
  letterMultipliers,
  bonusMultipliers,
  bingoBonus,
  tilesUsed,
  onWordChange,
  onPointsChange,
  onLetterMultiplierChange,
  onBonusMultiplierChange,
  onResetBonuses
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleValidateWord = async () => {
    if (!word.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await validateWordUtil(word);
      setValidationResult(result);
    } catch (error) {
      console.error('Word validation error:', error);
    }
    
    setIsValidating(false);
  };

  const handleResetLetterMultipliers = () => {
    // Reset all letter multipliers to 1
    const resetMultipliers = new Array(word.length).fill(1);
    // This would need to be handled by the parent component
    // For now, we'll call the existing reset function
    onResetBonuses();
  };

  const suggestedPoints = word ? calculateWordValue(word) : 0;
  const bonusCalculatedPoints = suggestedPoints ? calculateBonusPoints(
    word, 
    letterMultipliers, 
    bonusMultipliers.wordMultiplier, 
    bingoBonus
  ) : 0;

  const hasBonuses = letterMultipliers.some(m => m > 1) || bonusMultipliers.wordMultiplier > 1 || bingoBonus;

  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Word
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => onWordChange(e.target.value)}
            placeholder="Enter your word..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleValidateWord()}
          />
          <button
            onClick={handleValidateWord}
            disabled={isValidating || !word.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isValidating ? '...' : 'Check'}
          </button>
        </div>
      </div>

      {/* Letter Tiles Display */}
      <LetterTiles
        word={word}
        letterMultipliers={letterMultipliers}
        bingoBonus={bingoBonus}
        tilesUsed={tilesUsed}
        onLetterMultiplierChange={onLetterMultiplierChange}
        onResetAll={handleResetLetterMultipliers}
      />

      {/* Validation Result */}
      {validationResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {validationResult.valid ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>
            "{validationResult.word}" is {validationResult.valid ? 'valid' : 'not valid'}
          </span>
        </div>
      )}

      {/* Compact Bonus Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Word Multipliers */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Word Bonus</label>
            <div className="flex gap-1">
              <button
                onClick={() => onBonusMultiplierChange({ ...bonusMultipliers, wordMultiplier: 1 })}
                className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 1 ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                1x
              </button>
              <button
                onClick={() => onBonusMultiplierChange({ ...bonusMultipliers, wordMultiplier: 2 })}
                className={`px-2 py-1 text-xs rounded ${bonusMultipliers.wordMultiplier === 2 ? 'bg-red-600 text-white' : 'bg-red-200 hover:bg-red-300'}`}
              >
                DW
              </button>
              <button
                onClick={() => onBonusMultiplierChange({ ...bonusMultipliers, wordMultiplier: 3 })}
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

      {/* Points Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Points to Add
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={points}
            onChange={(e) => onPointsChange(e.target.value)}
            placeholder="Enter points..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {word && (
            <div className="flex gap-2">
              <button
                onClick={() => onPointsChange(suggestedPoints.toString())}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Base: {suggestedPoints}
              </button>
              {hasBonuses && (
                <button
                  onClick={() => onPointsChange(bonusCalculatedPoints.toString())}
                  className="px-3 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-medium"
                >
                  Total: {bonusCalculatedPoints}
                </button>
              )}
            </div>
          )}
        </div>
        {word && (
          <p className="text-sm text-gray-500 mt-1">
            Base: {suggestedPoints} pts
            {hasBonuses && ` → With bonuses: ${bonusCalculatedPoints} pts`}
          </p>
        )}
      </div>
    </div>
  );
};

export default WordInput;

