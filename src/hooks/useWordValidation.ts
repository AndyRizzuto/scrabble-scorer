import { useState, useCallback } from 'react';
import { validateWord } from '../utils/scoring';
import { ValidationResult } from '../types/game';

export function useWordValidation(onValidationChange?: (result: ValidationResult | null) => void) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateWordAsync = useCallback(async (word: string) => {
    if (!word || word.length < 2) return;
    setIsValidating(true);
    try {
      const result = await validateWord(word);
      setValidationResult(result);
      if (onValidationChange) onValidationChange(result);
    } catch (error) {
      setValidationResult(null);
    }
    setIsValidating(false);
  }, [onValidationChange]);

  return { validationResult, isValidating, validateWordAsync, setValidationResult };
}
