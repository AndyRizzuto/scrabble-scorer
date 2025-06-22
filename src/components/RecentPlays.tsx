import React from 'react';
import { GameHistoryEntry } from '../types/game';

interface RecentPlaysProps {
  recentPlays: GameHistoryEntry[];
  players?: {
    player1: { name: string };
    player2: { name: string };
  };
  onResetGame?: () => void;
}

const RecentPlays: React.FC<RecentPlaysProps> = ({ recentPlays, players, onResetGame }) => (
  <div className="col-span-3 bg-gray-50 rounded-lg p-3 border">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-semibold text-gray-700">Recent Plays</h4>
      {onResetGame && (
        <button
          onClick={onResetGame}
          className="text-xs text-red-600 hover:text-red-800 underline transition-colors"
          title="Reset game"
        >
          reset
        </button>
      )}
    </div>
    {recentPlays.length === 0 ? (
      <div className="text-xs text-gray-500 italic text-center py-4">No plays yet</div>
    ) : (
      <div className="space-y-1 max-h-24 overflow-y-auto">
        <div className="grid grid-cols-4 gap-1 text-xs font-medium text-gray-600 border-b border-gray-300 pb-1">
          <div>Player</div>
          <div>Word</div>
          <div>Points</div>
          <div>Time</div>
        </div>
        {recentPlays.slice(-4).reverse().map((play, index) => (
          <div key={index} className="grid grid-cols-4 gap-1 text-xs py-0.5">
            <div className={`font-medium truncate ${
              play.player === 1 ? 'text-blue-600' : 'text-purple-600'
            }`}>
              {players?.[`player${play.player}`]?.name?.slice(0, 6) || `P${play.player}`}
            </div>
            <div className="text-gray-700 truncate font-mono">{play.word}</div>
            <div className="text-gray-600 font-medium">{play.points}</div>
            <div className="text-gray-500 text-xs">{play.time.slice(-8, -3)}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default RecentPlays;
