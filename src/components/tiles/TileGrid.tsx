import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, PlusCircle, CheckCircle2, Undo2 } from 'lucide-react';
import TileInput from './TileInput';
import WordShelf from '../game/WordShelf';
import SuccessAnimation from '../animations/SuccessAnimation';
import { calculateWordValue, calculateBonusPoints, validateWord, LETTER_VALUES } from '../../utils/scoring';
import { ValidationResult, GameHistoryEntry } from '../../types/game';

interface TileGridProps {
  onAddWord: (word: string, points: number, wordData?: Partial<{
    basePoints: number;
    bonusPoints: number;
    bonuses: {letterMultiplier: number; wordMultiplier: number};
    letterMultipliers: number[];
    bingoBonus: boolean;
  }>) => void;
  onClear: () => void;
  onWordChange?: (word: string, points: number, tiles?: number) => void;
  onValidationChange?: (result: ValidationResult | null) => void;
  currentTurnWords?: Array<{word: string; points: number; definition?: string}>;
  onRemoveWord?: (index: number, currentWordInfo?: {word: string, points: number, isValid: boolean}) => void;
  onWordClick?: (word: string, definition?: string) => void;
  restoreToTiles?: string;
  restoreMultipliers?: {
    letterMultipliers: number[];
    wordMultiplier: number;
  };
  onCompleteTurn?: () => void;
  onAddWordAndCompleteTurn?: (word: string, points: number, wordData?: Partial<{
    basePoints: number;
    bonusPoints: number;
    bonuses: {letterMultiplier: number; wordMultiplier: number};
    letterMultipliers: number[];
    bingoBonus: boolean;
  }>) => void;
}

const TileGrid: React.FC<TileGridProps> = ({ 
  onAddWord, 
  onClear, 
  onWordChange, 
  onValidationChange,
  currentTurnWords = [],
  onRemoveWord,
  onWordClick,
  restoreToTiles,
  restoreMultipliers,
  onCompleteTurn,
  onAddWordAndCompleteTurn
}) => {
  // --- Move getCurrentWord and calculateCurrentPoints to the very top of the component, before any useEffect or usage ---
  const [letters, setLetters] = useState<string[]>(new Array(7).fill(''));
  const [multipliers, setMultipliers] = useState<number[]>(new Array(7).fill(1));
  const [wordMultiplier, setWordMultiplier] = useState(1);
  // Bingo bonus is auto-detected when all 7 tiles are used
  const [currentFocus, setCurrentFocus] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationType, setSuccessAnimationType] = useState<'word-added' | 'turn-completed' | 'bingo'>('word-added');
  const [successPoints, setSuccessPoints] = useState(0);

  const tileRefs = useRef<HTMLInputElement[]>([]);

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

  // Restore word to tiles when restoreToTiles prop changes
  useEffect(() => {
    if (restoreToTiles && restoreToTiles.length > 0) {
      const newLetters = new Array(7).fill('');
      const wordLetters = restoreToTiles.split('');
      
      // Place letters starting from index 0
      wordLetters.forEach((letter, index) => {
        if (index < 7) {
          newLetters[index] = letter;
        }
      });
      
      setLetters(newLetters);
      setCurrentFocus(wordLetters.length < 7 ? wordLetters.length : 0);
      
      // Restore multipliers if provided, otherwise reset
      if (restoreMultipliers) {
        setMultipliers(restoreMultipliers.letterMultipliers.slice(0, 7).concat(new Array(Math.max(0, 7 - restoreMultipliers.letterMultipliers.length)).fill(1)));
        setWordMultiplier(restoreMultipliers.wordMultiplier);
      } else {
        setMultipliers(new Array(7).fill(1));
        setWordMultiplier(1);
      }
      
      setValidationResult(null);
      
      // Trigger validation for the restored word
      if (restoreToTiles.length >= 2) {
        validateWordAsync(restoreToTiles);
      }
    }
  }, [restoreToTiles, restoreMultipliers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'Enter') {
        if (e.metaKey || e.ctrlKey) {
          // Command+Return (Mac) or Ctrl+Return (Windows/Linux) = Complete Turn
          e.preventDefault();
          const word = getCurrentWord();
          const isValidWord = word && validationResult?.valid;
          const hasWordsInTray = currentTurnWords.length > 0;
          
          // Complete turn if there's a valid word on tiles OR words in tray
          if (isValidWord || hasWordsInTray) {
            handleCompleteTurn();
          }
        } else {
          // Return = Add Another Word
          e.preventDefault();
          const word = getCurrentWord();
          const points = calculateCurrentPoints();
          if (word && points > 0 && validationResult?.valid) {
            handleAddWord();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [letters, multipliers, wordMultiplier, validationResult?.valid, currentTurnWords, getCurrentWord, calculateCurrentPoints]);

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

  const handleAddWord = () => {
    const word = getCurrentWord();
    const points = calculateCurrentPoints();
    const basePoints = calculateWordValue(word);
    const usedTiles = letters.filter(l => l !== '').length;
    const isBingo = usedTiles === 7;
    
    // Only allow adding valid words
    if (word && points > 0 && validationResult?.valid) {
      onAddWord(word, points, {
        basePoints,
        bonusPoints: points - basePoints,
        bonuses: { letterMultiplier: 1, wordMultiplier },
        letterMultipliers: multipliers.slice(0, usedTiles),
        bingoBonus: isBingo
      });
      
      // Show success animation
      setSuccessPoints(points);
      setSuccessAnimationType(isBingo ? 'bingo' : 'word-added');
      setShowSuccessAnimation(true);
      
      handleClear();
    }
  };

  // Handler for Complete Turn button
  const handleCompleteTurn = () => {
    const totalPoints = currentTurnWords.reduce((sum, word) => sum + word.points, 0);
    const currentWordPoints = currentWord && validationResult?.valid ? calculateCurrentPoints() : 0;
    
    if (currentWord && validationResult?.valid) {
      // If there's a valid word on tiles, add it first then complete
      handleAddWord();
      setTimeout(() => {
        // Show turn completion animation
        setSuccessPoints(totalPoints + currentWordPoints);
        setSuccessAnimationType(usedTiles === 7 ? 'bingo' : 'turn-completed');
        setShowSuccessAnimation(true);
        
        // Complete the turn
        if (onCompleteTurn) {
          onCompleteTurn();
        }
      }, 100);
    } else if (!currentWord && currentTurnWords.length > 0) {
      // No current word, just complete the turn with existing words
      setSuccessPoints(totalPoints);
      setSuccessAnimationType('turn-completed');
      setShowSuccessAnimation(true);
      
      if (onCompleteTurn) onCompleteTurn();
    }
    // If input is not empty and not valid, do nothing (button should be disabled)
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
      {/* Bingo Indicator Row */}
      {usedTiles === 7 && (
        <div className="flex justify-center">
          <div className={`px-4 py-2 rounded-full text-lg font-bold border transition-all duration-300 ${
            showConfetti 
              ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 animate-pulse' 
              : 'bg-yellow-100 text-yellow-800 border-yellow-300'
          }`}>
            🎉 BINGO! +50 Points
          </div>
        </div>
      )}

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


      {/* Split Layout: Action Buttons (35%) | Turn Words (65%) */}
      <div className="grid grid-cols-5 gap-4 min-h-[120px]">
        {/* Controls - Left Side */}
        <div className="col-span-2 space-y-3">
          {/* Word Multiplier */}
          <button
            onClick={() => setWordMultiplier(wordMultiplier === 1 ? 2 : wordMultiplier === 2 ? 3 : 1)}
            className={`w-full px-4 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${
              wordMultiplier === 1 
                ? 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200' 
                : wordMultiplier === 2 
                  ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-2 border-red-300 hover:from-red-200 hover:to-red-300 shadow-md' 
                  : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-2 border-purple-300 hover:from-purple-200 hover:to-purple-300 shadow-md'
            }`}
          >
            {wordMultiplier}× Word
          </button>

          
          {/* Complete Turn Button */}
          <button
            type="button"
            onClick={handleCompleteTurn}
            disabled={
              (currentWord && !validationResult?.valid) ||
              isValidating ||
              (!currentWord && currentTurnWords.length === 0)
            }
            className="w-full flex flex-col items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 transition-colors font-medium touch-manipulation"
            title={
              (currentWord && !validationResult?.valid)
                ? 'Enter a valid word or clear the input to complete the turn.'
                : undefined
            }
          >
            <span>Complete Turn</span>
            <span className="text-xs">{(currentWord && validationResult?.valid ? calculateCurrentPoints() : 0) + currentTurnWords.reduce((sum, word) => sum + word.points, 0)} points</span>
          </button>
        </div>

        {/* Turn Words - Right Side */}
        <div className="col-span-3">
          <WordShelf
            currentTurnWords={currentTurnWords}
            onRemoveWord={onRemoveWord}
            onWordClick={onWordClick}
            currentWordInfo={{
              word: currentWord,
              points: currentPoints,
              isValid: validationResult?.valid || false
            }}
            onAddWord={currentWord && validationResult?.valid ? handleAddWord : undefined}
            className="h-full"
          />
        </div>
      </div>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        type={successAnimationType}
        points={successPoints}
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </div>
  );
};

export default TileGrid;