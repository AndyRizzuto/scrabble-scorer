import { useState, useCallback, useEffect } from 'react';
import { validateWord } from '../utils/scoring';
import { ValidationResult } from '../types/game';

interface UseWordValidationReturn {
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validateWordAsync: (word: string) => Promise<void>;
  setValidationResult: (result: ValidationResult | null) => void;
}

export const useWordValidation = (
  onValidationChange?: (result: ValidationResult | null) => void
): UseWordValidationReturn => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateWordAsync = useCallback(async (word: string) => {
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
  }, [onValidationChange]);

  // Clear validation result when setting to null and notify parent
  const setValidationResultWithCallback = useCallback((result: ValidationResult | null) => {
    setValidationResult(result);
    if (onValidationChange) {
      onValidationChange(result);
    }
  }, [onValidationChange]);

  return {
    validationResult,
    isValidating,
    validateWordAsync,
    setValidationResult: setValidationResultWithCallback,
  };
};