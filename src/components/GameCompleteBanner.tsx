import React from 'react';
import { CheckCircle } from 'lucide-react';

interface GameCompleteBannerProps {
  winner: 1 | 2 | null;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
}

const GameCompleteBanner: React.FC<GameCompleteBannerProps> = ({
  winner,
  player1Name,
  player2Name,
  player1Score,
  player2Score
}) => (
  <div className="text-center py-8 bg-gray-50 rounded-lg">
    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Complete</h3>
    <p className="text-gray-600 mb-4">This game has been finalized and cannot be edited.</p>
    <div className="text-lg font-bold">
      {winner === 1 ? player1Name : winner === 2 ? player2Name : 'Tie'}
      {winner ? ' Won!' : ''}
    </div>
    <div className="text-sm text-gray-500 mt-2">
      Final Score: {player1Score} - {player2Score}
    </div>
  </div>
);

export default GameCompleteBanner;
