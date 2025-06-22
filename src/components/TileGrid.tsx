import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Users, User } from 'lucide-react';
import TileInput from './TileInput';
import { calculateWordValue, calculateBonusPoints, validateWord } from '../utils/scoring';
import { ValidationResult, GameHistoryEntry } from '../types/game';

interface TileGridProps {
  onAddWord: (word: string, points: number) => void;
  onClear: () => void;
  onWordChange?: (word: string, points: number, tiles?: number) => void;
  onValidationChange?: (result: ValidationResult | null) => void;
  onToggleMultiWordMode?: () => void;
  showMultiWordMode?: boolean;
  recentPlays?: GameHistoryEntry[];
  players?: {
    player1: { name: string };
    player2: { name: string };
  };
  onResetGame?: () => void;
}

const TileGrid: React.FC<TileGridProps> = ({ 
  onAddWord, 
  onClear, 
  onWordChange, 
  onValidationChange,
  onToggleMultiWordMode,
  showMultiWordMode = false,
  recentPlays = [],
  players,
  onResetGame
}) => {
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

  // Update parent with current word/points whenever they change
  useEffect(() => {
    const word = getCurrentWord();
    const points = calculateCurrentPoints();
    const usedTiles = letters.filter(l => l !== '').length;
    if (onWordChange) {
      onWordChange(word, points, usedTiles);
    }
  }, [letters, multipliers, wordMultiplier, onWordChange]);

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
      if (onValidationChange) {
        onValidationChange(result);
      }
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
    if (onValidationChange) {
      onValidationChange(null);
    }
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
      {/* Compact Controls Row */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
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
            <div className={`px-3 py-1 rounded-full text-sm font-bold border transition-all duration-300 ${
              showConfetti 
                ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 animate-pulse' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
            }`}>
              🎉 BINGO! +50
            </div>
          )}
        </div>

        {/* Compact Action Icons */}
        <div className="flex items-center space-x-2">
          {onToggleMultiWordMode && (
            <button
              onClick={onToggleMultiWordMode}
              className={`p-1.5 rounded-lg transition-colors ${
                showMultiWordMode 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
              }`}
              title={showMultiWordMode ? 'Exit multi-word mode' : 'Enable multi-word mode'}
            >
              {showMultiWordMode ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            </button>
          )}
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


      {/* Loading indicator for validation */}
      {isValidating && currentWord.length >= 2 && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">Checking word...</span>
        </div>
      )}


      {/* Split Layout: Action Buttons (25%) | Recent Plays (75%) */}
      <div className="grid grid-cols-4 gap-4">
        {/* Action Buttons - Left Side */}
        <div className="space-y-2">
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
          
          <button
            onClick={handleAddWord}
            disabled={!currentWord || isValidating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-colors font-medium touch-manipulation text-sm"
          >
            {isValidating ? 'Checking...' : 'Add Word'}
          </button>

          {onResetGame && (
            <button
              onClick={onResetGame}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors font-medium touch-manipulation text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game</span>
            </button>
          )}
        </div>

        {/* Recent Plays - Right Side with 4 Columns (75% width) */}
        <div className="col-span-3 bg-gray-50 rounded-lg p-3 border">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Plays</h4>
          
          {recentPlays.length === 0 ? (
            <div className="text-xs text-gray-500 italic text-center py-4">No plays yet</div>
          ) : (
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {/* Header Row */}
              <div className="grid grid-cols-4 gap-1 text-xs font-medium text-gray-600 border-b border-gray-300 pb-1">
                <div>Player</div>
                <div>Word</div>
                <div>Points</div>
                <div>Time</div>
              </div>
              
              {/* Data Rows */}
              {recentPlays.slice(-4).reverse().map((play, index) => (
                <div key={index} className="grid grid-cols-4 gap-1 text-xs py-0.5">
                  <div className={`font-medium truncate ${
                    play.player === 1 ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {players?.[`player${play.player}`]?.name?.slice(0, 6) || `P${play.player}`}
                  </div>
                  <div className="text-gray-700 truncate font-mono">{play.word}</div>
                  <div className="text-gray-600 font-medium">{play.points}</div>
                  <div className="text-gray-500 text-xs">{play.time.slice(-8, -3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TileGrid;