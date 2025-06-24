import { useState, useEffect } from 'react';
import { calculateBonusPoints } from '../utils/scoring';

interface UseTileInputStateReturn {
  letters: string[];
  multipliers: number[];
  wordMultiplier: number;
  currentFocus: number;
  setLetters: (letters: string[]) => void;
  setMultipliers: (multipliers: number[]) => void;
  setWordMultiplier: (multiplier: number) => void;
  setCurrentFocus: (focus: number) => void;
  handleLetterChange: (index: number, letter: string) => void;
  handleMultiplierChange: (index: number) => void;
  handleNext: (index: number) => void;
  handlePrevious: (index: number) => void;
  getCurrentWord: () => string;
  calculateCurrentPoints: () => number;
  clearTiles: () => void;
}

export const useTileInputState = (): UseTileInputStateReturn => {
  const [letters, setLetters] = useState<string[]>(new Array(7).fill(''));
  const [multipliers, setMultipliers] = useState<number[]>(new Array(7).fill(1));
  const [wordMultiplier, setWordMultiplier] = useState(1);
  const [currentFocus, setCurrentFocus] = useState(0);

  const handleLetterChange = (index: number, letter: string) => {
    const newLetters = [...letters];
    newLetters[index] = letter;
    setLetters(newLetters);
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
    const isBingo = usedTiles === 7;
    
    return calculateBonusPoints(word, multipliers, wordMultiplier, isBingo);
  };

  const clearTiles = () => {
    setLetters(new Array(7).fill(''));
    setMultipliers(new Array(7).fill(1));
    setWordMultiplier(1);
    setCurrentFocus(0);
  };

  return {
    letters,
    multipliers,
    wordMultiplier,
    currentFocus,
    setLetters,
    setMultipliers,
    setWordMultiplier,
    setCurrentFocus,
    handleLetterChange,
    handleMultiplierChange,
    handleNext,
    handlePrevious,
    getCurrentWord,
    calculateCurrentPoints,
    clearTiles
  };
};