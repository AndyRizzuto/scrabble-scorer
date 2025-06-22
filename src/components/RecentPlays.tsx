import React from 'react';
import { Undo2 } from 'lucide-react';
import { calculateWordValue, LETTER_VALUES } from '../utils/scoring';
import { GameHistoryEntry } from '../types/game';

interface RecentPlaysProps {
  recentPlays: GameHistoryEntry[];
  players?: {
    player1: { name: string };
    player2: { name: string };
  };
  onResetGame?: () => void;
  onUndoTurn?: (turnIndex: number) => void;
}

const RecentPlays: React.FC<RecentPlaysProps> = ({ recentPlays, players, onResetGame, onUndoTurn }) => {
  return (
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
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {/* Group plays by turn */}
          {(() => {
            const turns: Array<{player: number, time: string, words: Array<{word: string, points: number}>}> = [];
            let currentTurn: {player: number, time: string, words: Array<{word: string, points: number}>} | null = null;
            recentPlays.slice(-6).reverse().forEach(play => {
              if (play.isTurnSummary) return;
              if (!currentTurn || currentTurn.player !== play.player) {
                if (currentTurn) turns.push(currentTurn);
                currentTurn = {
                  player: play.player,
                  time: play.time,
                  words: [{word: play.word, points: play.points}]
                };
              } else {
                currentTurn.words.push({word: play.word, points: play.points});
              }
            });
            if (currentTurn) turns.push(currentTurn);
            return turns.map((turn, turnIndex) => {
              const totalPoints = turn.words.reduce((sum, word) => sum + word.points, 0);
              const playerColor = turn.player === 1 ? 'blue' : 'purple';
              const bgColor = turn.player === 1 ? 'bg-blue-50' : 'bg-purple-50';
              const borderColor = turn.player === 1 ? 'border-blue-200' : 'border-purple-200';
              const textColor = turn.player === 1 ? 'text-blue-700' : 'text-purple-700';
              const bonusColor = turn.player === 1 ? 'text-blue-600' : 'text-purple-600';
              const getTimeAgo = (timeString: string) => {
                try {
                  const playTime = new Date(timeString).getTime();
                  if (isNaN(playTime)) return "just now";
                  const now = Date.now();
                  const diffMs = now - playTime;
                  const diffSec = Math.floor(diffMs / 1000);
                  const diffMin = Math.floor(diffSec / 60);
                  const diffHour = Math.floor(diffMin / 60);
                  const diffDays = Math.floor(diffHour / 24);
                  if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                  if (diffHour > 0) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
                  if (diffMin > 0) return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
                  if (diffSec > 0) return `${diffSec} ${diffSec === 1 ? 'sec' : 'secs'} ago`;
                  return "just now";
                } catch { return "just now"; }
              };
              return (
                <div key={turnIndex} className={`${bgColor} ${borderColor} border rounded-lg p-2 relative group`}>
                  <button
                    onClick={() => onUndoTurn?.(turnIndex)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white shadow-sm border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                    title="Undo turn"
                  >
                    <Undo2 className="w-3 h-3 text-gray-600" />
                  </button>
                  <div className={`flex justify-between items-center mb-1 ${textColor} text-xs font-semibold pr-6`}>
                    <span>{players?.[`player${turn.player}`]?.name || `Player ${turn.player}`}</span>
                    <span className="text-gray-500">{getTimeAgo(turn.time)}</span>
                  </div>
                  <div className="space-y-1">
                    {turn.words.map((word, wordIndex) => {
                      const correspondingPlay = recentPlays.find(play => 
                        play.word === word.word && play.points === word.points && play.player === turn.player
                      );
                      const baseScore = calculateWordValue(word.word);
                      const bonusScore = word.points - baseScore;
                      const bonuses = correspondingPlay?.bonuses;
                      return (
                        <div key={wordIndex} className="text-xs font-mono">
                          {(() => {
                            const letterMultiplierBonuses = correspondingPlay?.letterMultipliers?.filter(m => m > 1) || [];
                            const wordMult = bonuses?.wordMultiplier || 1;
                            const bingoBonus = correspondingPlay?.bingoBonus ? 50 : 0;
                            const labels = [word.word];
                            const values = [baseScore];
                            letterMultiplierBonuses.forEach((mult, idx) => {
                              const actualIdx = correspondingPlay?.letterMultipliers?.findIndex(m => m === mult) || 0;
                              const letterValue = (LETTER_VALUES[word.word.charAt(actualIdx)] || 1);
                              const bonus = letterValue * (mult - 1);
                              labels.push(`+${word.word.charAt(actualIdx)}×${mult}`);
                              values.push(bonus);
                            });
                            if (wordMult > 1) {
                              const preMultTotal = values.reduce((sum, val) => sum + val, 0);
                              const multiplierBonus = preMultTotal * (wordMult - 1);
                              labels.push(`×${wordMult}`);
                              values.push(multiplierBonus);
                            }
                            if (bingoBonus > 0) {
                              labels.push('Bonus!🎉');
                              values.push(bingoBonus);
                            }
                            labels.push('=');
                            values.push(word.points);
                            return (
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-end gap-2">
                                  {labels.map((label, idx) => (
                                    <div key={idx} className={`text-center min-w-[3rem] ${
                                      idx === 0 ? 'text-gray-700 font-semibold' : 
                                      label.includes('L×') ? 'text-red-600' :
                                      label.includes('×') ? 'text-purple-600' :
                                      label.includes('Bonus') ? bonusColor + ' font-bold' :
                                      'text-gray-600'
                                    }`}>
                                      {label}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  {values.map((value, idx) => (
                                    <div key={idx} className={`text-center min-w-[3rem] font-medium ${
                                      idx === 0 ? 'text-gray-700' :
                                      typeof value === 'string' ? 'text-gray-600 text-lg font-bold' :
                                      idx === values.length - 1 ? 'text-gray-700 font-bold' :
                                      'text-gray-600'
                                    }`}>
                                      {typeof value === 'string' && value === '' ? word.points : value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                  {turn.words.length > 1 && (
                    <div className="mt-1 pt-1 border-t border-gray-400">
                      <div className={`flex justify-between text-xs font-bold ${textColor}`}>
                        <span>Total</span>
                        <span>{totalPoints}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default RecentPlays;
