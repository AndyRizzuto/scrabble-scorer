import React from 'react';
import LogoWithFallback from './LogoWithFallback';

interface HeaderNavProps {
  currentPage: 'game' | 'score' | 'timeline';
  hasCurrentGame: boolean;
  onPageChange: (page: 'game' | 'score' | 'timeline') => void;
  onShowSetup: () => void;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ currentPage, hasCurrentGame, onPageChange, onShowSetup }) => (
  <div className="flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center">
      <LogoWithFallback />
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => {
          if (hasCurrentGame) {
            onPageChange('game');
          } else {
            onShowSetup();
          }
        }}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 'game'
            ? 'bg-green-600 text-white'
            : hasCurrentGame
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {hasCurrentGame ? 'Game' : 'New Game'}
      </button>
      <button
        onClick={() => onPageChange('score')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 'score'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <span style={{ fontFamily: 'cursive', fontWeight: 'bold' }}>Score</span>
      </button>
      <button
        onClick={() => onPageChange('timeline')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 'timeline'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Timeline
      </button>
    </div>
    <div className="w-16"></div>
  </div>
);

export default HeaderNav;
