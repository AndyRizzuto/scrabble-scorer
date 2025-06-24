import { useEffect } from 'react';

interface UseRestoreTilesProps {
  restoreToTiles?: string;
  restoreMultipliers?: {
    letterMultipliers: number[];
    wordMultiplier: number;
  };
  setLetters: (letters: string[]) => void;
  setMultipliers: (multipliers: number[]) => void;
  setWordMultiplier: (multiplier: number) => void;
  setCurrentFocus: (focus: number) => void;
  validateWordAsync: (word: string) => Promise<void>;
}

export const useRestoreTiles = ({
  restoreToTiles,
  restoreMultipliers,
  setLetters,
  setMultipliers,
  setWordMultiplier,
  setCurrentFocus,
  validateWordAsync
}: UseRestoreTilesProps) => {
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
      
      // Trigger validation for the restored word
      if (restoreToTiles.length >= 2) {
        validateWordAsync(restoreToTiles);
      }
    }
  }, [restoreToTiles, restoreMultipliers, setLetters, setMultipliers, setWordMultiplier, setCurrentFocus, validateWordAsync]);
};