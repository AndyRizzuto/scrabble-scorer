import { useState, useEffect } from 'react';

interface UseBingoConfettiReturn {
  showConfetti: boolean;
}

export const useBingoConfetti = (letters: string[]): UseBingoConfettiReturn => {
  const [showConfetti, setShowConfetti] = useState(false);

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

  return {
    showConfetti,
  };
};