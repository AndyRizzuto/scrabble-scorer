import { useState } from 'react';
import { validateWord } from '../utils/scoring';
import { ValidationResult } from '../types/game';

interface UseWordValidationReturn {
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validateWordAsync: (word: string) => Promise<void>;
  clearValidation: () => void;
}

export const useWordValidation = (onValidationChange?: (result: ValidationResult | null) => void): UseWordValidationReturn => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateWordAsync = async (word: string) => {
    if (!word || word.length < 2) return;
    
    setIsValidating(true);
    try {
      const result = await validateWord(word);
      setValidationResult(result);
      onValidationChange?.(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const clearValidation = () => {
    setValidationResult(null);
    onValidationChange?.(null);
  };

  return {
    validationResult,
    isValidating,
    validateWordAsync,
    clearValidation
  };
};