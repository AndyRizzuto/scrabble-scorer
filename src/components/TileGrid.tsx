import React, { useState, useRef, useEffect } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import TileInput from './TileInput';
import { calculateWordValue, calculateBonusPoints, validateWord } from '../utils/scoring';
import { ValidationResult } from '../types/game';

interface TileGridProps {
  onAddWord: (word: string, points: number) => void;
  onClear: () => void;
}

const TileGrid: React.FC<TileGridProps> = ({ onAddWord, onClear }) => {
  const [letters, setLetters] = useState<string[]>(new Array(7).fill(''));
  const [multipliers, setMultipliers] = useState<number[]>(new Array(7).fill(1));
  const [wordMultiplier, setWordMultiplier] = useState(1);
  // Bingo bonus is auto-detected when all 7 tiles are used
  const [currentFocus, setCurrentFocus] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const tileRefs = useRef<HTMLInputElement[]>([]);

  // Trigger confetti when bingo is achieved
  useEffect(() => {
    const usedTiles = letters.filter(l => l !== '').length;
    const currentWord = letters.join('').trim();
    if (usedTiles === 7 && currentWord.length >= 7) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [letters]);

  const handleLetterChange = (index: number, letter: string) => {
    const newLetters = [...letters];
    newLetters[index] = letter;
    setLetters(newLetters);
    setValidationResult(null); // Clear validation when typing
    
    // Auto-validate if we have a complete word
    const newWord = newLetters.join('').trim();
    if (newWord.length >= 2) {
      validateWordAsync(newWord);
    }
  };

  const validateWordAsync = async (word: string) => {
    if (!word || word.length < 2) return;
    
    setIsValidating(true);
    try {
      const result = await validateWord(word);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
    }
    setIsValidating(false);
  };

  const handleMultiplierChange = (index: number) => {
    const newMultipliers = [...multipliers];
    newMultipliers[index] = newMultipliers[index] === 1 ? 2 : newMultipliers[index] === 2 ? 3 : 1;
    setMultipliers(newMultipliers);
  };

  const handleNext = (index: number) => {
    if (index < 6) {
      setCurrentFocus(index + 1);
    }
  };

  const handlePrevious = (index: number) => {
    if (index > 0) {
      setCurrentFocus(index - 1);
    }
  };

  const getCurrentWord = () => {
    return letters.join('').trim();
  };

  const calculateCurrentPoints = () => {
    const word = getCurrentWord();
    if (!word) return 0;

    const usedTiles = letters.filter(l => l !== '').length;
    const isBingo = usedTiles === 7; // Auto-detect bingo when all 7 tiles are used
    
    return calculateBonusPoints(word, multipliers, wordMultiplier, isBingo);
  };


  const handleAddWord = () => {
    const word = getCurrentWord();
    const points = calculateCurrentPoints();
    
    if (word && points > 0) {
      onAddWord(word, points);
      handleClear();
    }
  };

  const handleClear = () => {
    setLetters(new Array(7).fill(''));
    setMultipliers(new Array(7).fill(1));
    setWordMultiplier(1);
    setCurrentFocus(0);
    setValidationResult(null);
    onClear();
  };

  const currentWord = getCurrentWord();
  const currentPoints = calculateCurrentPoints();
  const usedTiles = letters.filter(l => l !== '').length;

  return (
    <div className="space-y-6 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="text-4xl animate-bounce">🎉🎊✨</div>
        </div>
      )}
      {/* Word Multiplier and Bingo Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Word:</span>
            <button
              onClick={() => setWordMultiplier(wordMultiplier === 1 ? 2 : wordMultiplier === 2 ? 3 : 1)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                wordMultiplier === 1 ? 'bg-gray-200 text-gray-700' :
                wordMultiplier === 2 ? 'bg-red-100 text-red-700 border border-red-300' :
                'bg-purple-100 text-purple-700 border border-purple-300'
              }`}
            >
              {wordMultiplier}x
            </button>
          </div>
          
          {usedTiles === 7 && (
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-bold border transition-all duration-300 ${
                showConfetti 
                  ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 animate-pulse' 
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}>
                🎉 BINGO! +50
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">Tiles: {usedTiles}/7</div>
        </div>
      </div>

      {/* Tile Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
          {letters.map((letter, index) => (
            <TileInput
              key={index}
              value={letter}
              multiplier={multipliers[index]}
              index={index}
              onLetterChange={handleLetterChange}
              onMultiplierChange={handleMultiplierChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              autoFocus={index === currentFocus}
            />
          ))}
        </div>
      </div>

      {/* Word Validation with Definition */}
      {validationResult && (
        <div className={`p-4 rounded-lg border ${
          validationResult.valid 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validationResult.valid ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-bold text-lg">
              {validationResult.word}
            </span>
            <span className="text-sm">
              {validationResult.valid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          {validationResult.definition && (
            <div className="text-sm italic pl-7">
              {validationResult.definition}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator for validation */}
      {isValidating && currentWord.length >= 2 && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Checking word...</span>
        </div>
      )}

      {/* Current Score Display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {currentPoints} points
        </div>
        {currentWord && (
          <div className="text-lg text-gray-600 mb-4">
            Word: {currentWord.toUpperCase()}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 px-4 py-4 sm:px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
        
        <button
          onClick={handleAddWord}
          disabled={!currentWord || isValidating}
          className="flex items-center justify-center gap-2 px-4 py-4 sm:px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-colors font-medium touch-manipulation"
        >
          {isValidating ? 'Checking...' : 'Add Word'}
        </button>
      </div>

    </div>
  );
};

export default TileGrid;