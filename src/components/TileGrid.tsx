import React, { useState, useRef, useEffect } from 'react';
import TileInput from './TileInput';
import WordMultiplierButton from './WordMultiplierButton';
import WordShelf from './WordShelf';
import BingoBadge from './BingoBadge';
import Confetti from './Confetti';
import ActionButtons from './ActionButtons';
import RecentPlays from './RecentPlays';
import { calculateWordValue, calculateBonusPoints } from '../utils/scoring';
import { ValidationResult, GameHistoryEntry } from '../types/game';
import { useWordValidation } from '../hooks/useWordValidation';

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
  recentPlays?: GameHistoryEntry[];
  players?: {
    player1: { name: string };
    player2: { name: string };
  };
  onResetGame?: () => void;
  currentTurnWords?: Array<{word: string; points: number; definition?: string}>;
  onRemoveWord?: (index: number, currentWordInfo?: {word: string, points: number, isValid: boolean}) => void;
  onWordClick?: (word: string, definition?: string) => void;
  restoreToTiles?: string;
  restoreMultipliers?: {
    letterMultipliers: number[];
    wordMultiplier: number;
  };
  onCompleteTurn?: () => void;
  onUndoTurn?: (turnIndex: number) => void;
}

const TileGrid: React.FC<TileGridProps> = ({ 
  onAddWord, 
  onClear, 
  onWordChange, 
  onValidationChange,
  recentPlays = [],
  players,
  onResetGame,
  currentTurnWords = [],
  onRemoveWord,
  onWordClick,
  restoreToTiles,
  restoreMultipliers,
  onCompleteTurn,
  onUndoTurn
}) => {
  const [letters, setLetters] = useState<string[]>(new Array(7).fill(''));
  const [multipliers, setMultipliers] = useState<number[]>(new Array(7).fill(1));
  const [wordMultiplier, setWordMultiplier] = useState(1);
  const [currentFocus, setCurrentFocus] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const tileRefs = useRef<HTMLInputElement[]>([]);

  // Use custom hook for validation
  const { validationResult, isValidating, validateWordAsync, setValidationResult } = useWordValidation(onValidationChange);

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
          if (onCompleteTurn && currentTurnWords.length > 0) {
            onCompleteTurn();
          }
        } else {
          // Return = Add Word
          e.preventDefault();
          const word = letters.join('').trim();
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
  }, [letters, multipliers, wordMultiplier, validationResult?.valid, currentTurnWords, onCompleteTurn, onAddWord]);

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
      handleClear();
    }
  };

  const currentWord = getCurrentWord();
  const currentPoints = calculateCurrentPoints();
  const usedTiles = letters.filter(l => l !== '').length;

  return (
    <div className="space-y-6 relative">
      <Confetti show={showConfetti} />
      {/* Compact Controls Row */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Word:</span>
            <WordMultiplierButton wordMultiplier={wordMultiplier} setWordMultiplier={setWordMultiplier} />
          </div>
          <WordShelf currentTurnWords={currentTurnWords} onWordClick={onWordClick} onRemoveWord={onRemoveWord} />
          <BingoBadge show={usedTiles === 7} showConfetti={showConfetti} />
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
        <ActionButtons
          onClear={handleClear}
          onAddWord={handleAddWord}
          isValidating={isValidating}
          currentWord={currentWord}
          validationResult={validationResult}
        />
        <RecentPlays recentPlays={recentPlays} players={players} onResetGame={onResetGame} />
      </div>
    </div>
  );
};

export default TileGrid;