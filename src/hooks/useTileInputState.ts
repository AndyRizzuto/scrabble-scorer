import { useState, useCallback } from 'react';
import { calculateWordValue, calculateBonusPoints } from '../utils/scoring';

interface UseTileInputStateReturn {
  // State
  letters: string[];
  multipliers: number[];
  wordMultiplier: number;
  currentFocus: number;
  
  // Methods
  handleLetterChange: (index: number, letter: string) => void;
  handleMultiplierChange: (index: number) => void;
  handleNext: (index: number) => void;
  handlePrevious: (index: number) => void;
  getCurrentWord: () => string;
  calculateCurrentPoints: () => number;
  handleClear: () => void;
  setLetters: (letters: string[]) => void;
  setMultipliers: (multipliers: number[]) => void;
  setWordMultiplier: (multiplier: number) => void;
  setCurrentFocus: (focus: number) => void;
}

export const useTileInputState = (
  onClear: () => void,
  onWordChange?: (word: string, points: number, tiles?: number) => void
): UseTileInputStateReturn => {
  const [letters, setLetters] = useState<string[]>(new Array(7).fill(''));
  const [multipliers, setMultipliers] = useState<number[]>(new Array(7).fill(1));
  const [wordMultiplier, setWordMultiplier] = useState(1);
  const [currentFocus, setCurrentFocus] = useState(0);

  const getCurrentWord = useCallback(() => {
    return letters.join('').trim();
  }, [letters]);

  const calculateCurrentPoints = useCallback(() => {
    const word = getCurrentWord();
    if (!word) return 0;

    const usedTiles = letters.filter(l => l !== '').length;
    const isBingo = usedTiles === 7; // Auto-detect bingo when all 7 tiles are used
    
    return calculateBonusPoints(word, multipliers, wordMultiplier, isBingo);
  }, [letters, multipliers, wordMultiplier, getCurrentWord]);

  const handleLetterChange = useCallback((index: number, letter: string) => {
    const newLetters = [...letters];
    newLetters[index] = letter;
    setLetters(newLetters);
  }, [letters]);

  const handleMultiplierChange = useCallback((index: number) => {
    const newMultipliers = [...multipliers];
    newMultipliers[index] = newMultipliers[index] === 1 ? 2 : newMultipliers[index] === 2 ? 3 : 1;
    setMultipliers(newMultipliers);
  }, [multipliers]);

  const handleNext = useCallback((index: number) => {
    if (index < 6) {
      setCurrentFocus(index + 1);
    }
  }, []);

  const handlePrevious = useCallback((index: number) => {
    if (index > 0) {
      setCurrentFocus(index - 1);
    }
  }, []);

  const handleClear = useCallback(() => {
    setLetters(new Array(7).fill(''));
    setMultipliers(new Array(7).fill(1));
    setWordMultiplier(1);
    setCurrentFocus(0);
    onClear();
  }, [onClear]);

  return {
    letters,
    multipliers, 
    wordMultiplier,
    currentFocus,
    handleLetterChange,
    handleMultiplierChange,
    handleNext,
    handlePrevious,
    getCurrentWord,
    calculateCurrentPoints,
    handleClear,
    setLetters,
    setMultipliers,
    setWordMultiplier,
    setCurrentFocus,
  };
};