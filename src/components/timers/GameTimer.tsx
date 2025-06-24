import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play } from 'lucide-react';

interface GameTimerProps {
  gameStartTime: number;
  gameEndTime?: number;
  pausedTime: number;
  lastPauseStart?: number;
  gameStatus: 'active' | 'paused' | 'final';
  onPause?: () => void;
  onResume?: () => void;
  compact?: boolean;
  className?: string;
}

const GameTimer: React.FC<GameTimerProps> = ({
  gameStartTime,
  gameEndTime,
  pausedTime,
  lastPauseStart,
  gameStatus,
  onPause,
  onResume,
  compact = false,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for live display
  useEffect(() => {
    if (gameStatus === 'active') {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus]);

  const calculateTotalTime = () => {
    const endTime = gameEndTime || currentTime;
    return endTime - gameStartTime;
  };

  const calculateActiveTime = () => {
    let totalPausedTime = pausedTime;
    
    // Add current pause time if game is paused
    if (gameStatus === 'paused' && lastPauseStart) {
      totalPausedTime += currentTime - lastPauseStart;
    }
    
    return calculateTotalTime() - totalPausedTime;
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalTime = calculateTotalTime();
  const activeTime = calculateActiveTime();

  const handleTogglePause = () => {
    if (gameStatus === 'active' && onPause) {
      onPause();
    } else if (gameStatus === 'paused' && onResume) {
      onResume();
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-mono text-gray-700">
          {formatTime(activeTime)}
        </span>
        {gameStatus !== 'final' && (onPause || onResume) && (
          <button
            onClick={handleTogglePause}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={gameStatus === 'active' ? 'Pause game' : 'Resume game'}
          >
            {gameStatus === 'active' ? (
              <Pause className="w-3 h-3 text-gray-600" />
            ) : (
              <Play className="w-3 h-3 text-gray-600" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Game Timer</h3>
        </div>
        
        {gameStatus !== 'final' && (onPause || onResume) && (
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              gameStatus === 'active'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {gameStatus === 'active' ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Play Time:</span>
          <span className={`font-mono font-semibold text-lg ${
            gameStatus === 'active' ? 'text-green-600' : 
            gameStatus === 'paused' ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {formatTime(activeTime)}
          </span>
        </div>
        
        {pausedTime > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Paused Time:</span>
            <span className="font-mono text-sm text-gray-500">
              {formatTime(pausedTime + (gameStatus === 'paused' && lastPauseStart ? currentTime - lastPauseStart : 0))}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600">Total Time:</span>
          <span className="font-mono text-sm text-gray-700">
            {formatTime(totalTime)}
          </span>
        </div>
      </div>

      {gameStatus === 'paused' && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800 text-center">Game is paused</p>
        </div>
      )}
    </div>
  );
};

export default GameTimer;