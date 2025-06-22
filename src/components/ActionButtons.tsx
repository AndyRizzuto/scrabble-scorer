import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ActionButtonsProps {
  onClear: () => void;
  onAddWord: () => void;
  isValidating: boolean;
  currentWord: string;
  validationResult: { valid: boolean } | null;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onClear, onAddWord, isValidating, currentWord, validationResult }) => (
  <div className="space-y-2">
    <button
      onClick={onClear}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation text-sm"
    >
      <RotateCcw className="w-4 h-4" />
      <span>Clear</span>
    </button>
    <button
      onClick={onAddWord}
      disabled={!currentWord || isValidating || !validationResult?.valid}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-colors font-medium touch-manipulation text-sm"
    >
      {isValidating ? 'Checking...' : 'Add Word'}
    </button>
  </div>
);

export default ActionButtons;
