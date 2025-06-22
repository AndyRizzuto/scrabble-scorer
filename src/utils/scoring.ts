export const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
} as const;

export const calculateWordValue = (word: string): number => {
  return word.toUpperCase().split('').reduce((sum, letter) => {
    return sum + (LETTER_VALUES[letter as keyof typeof LETTER_VALUES] || 0);
  }, 0);
};

export const calculateBonusPoints = (
  word: string,
  letterMultipliers: number[],
  wordMultiplier: number,
  bingoBonus: boolean = false
): number => {
  let totalWithLetterBonuses = 0;
  const letters = word.toUpperCase().split('');
  
  letters.forEach((letter, index) => {
    const letterValue = LETTER_VALUES[letter as keyof typeof LETTER_VALUES] || 0;
    const multiplier = letterMultipliers[index] || 1;
    totalWithLetterBonuses += letterValue * multiplier;
  });
  
  const finalPoints = totalWithLetterBonuses * wordMultiplier;
  const bingoAddition = bingoBonus ? 50 : 0;
  return Math.round(finalPoints) + bingoAddition;
};

export const validateWord = async (word: string): Promise<{ valid: boolean; word: string; definition?: string }> => {
  if (!word.trim()) {
    return { valid: false, word: word.toUpperCase() };
  }
  
  try {
    // Try to get definition from Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    
    if (response.ok) {
      const data = await response.json();
      const entry = data[0];
      
      // Extract first definition
      const firstMeaning = entry?.meanings?.[0];
      const firstDefinition = firstMeaning?.definitions?.[0];
      const partOfSpeech = firstMeaning?.partOfSpeech || '';
      const definition = firstDefinition?.definition || '';
      
      const formattedDefinition = partOfSpeech ? `(${partOfSpeech}) ${definition}` : definition;
      
      return {
        valid: true,
        word: word.toUpperCase(),
        definition: formattedDefinition
      };
    } else {
      // Fallback: basic validation for words not in dictionary
      const isValid = /^[a-zA-Z]+$/.test(word) && word.length >= 2;
      return {
        valid: isValid,
        word: word.toUpperCase(),
        definition: isValid ? 'Valid word (no definition available)' : undefined
      };
    }
  } catch (error) {
    // Fallback validation if API fails
    const isValid = /^[a-zA-Z]+$/.test(word) && word.length >= 2;
    return {
      valid: isValid,
      word: word.toUpperCase(),
      definition: isValid ? 'Valid word (offline mode)' : undefined
    };
  }
};

