import React from 'react';
import TurnTimer from './TurnTimer';

interface ResponsiveTimerProps {
  isActive: boolean;
  onTimerExpired?: () => void;
  onTimerPaused?: () => void;
  currentPlayer: 1 | 2;
  turnStartTime?: number;
}

const ResponsiveTimer: React.FC<ResponsiveTimerProps> = ({ isActive, onTimerExpired, onTimerPaused, currentPlayer, turnStartTime }) => {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <div className="flex items-center gap-2">
      {collapsed ? (
        <button
          className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={() => setCollapsed(false)}
          aria-label="Expand timer"
        >
          <span className="text-lg">⏱️</span>
        </button>
      ) : (
        <div onClick={() => setCollapsed(true)} className="cursor-pointer">
          <TurnTimer
            isActive={isActive}
            onTimerExpired={onTimerExpired}
            onTimerPaused={onTimerPaused}
            currentPlayer={currentPlayer}
            turnStartTime={turnStartTime}
          />
        </div>
      )}
    </div>
  );
};

export default ResponsiveTimer;
