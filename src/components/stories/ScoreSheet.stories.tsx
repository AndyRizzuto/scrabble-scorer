import React from 'react';
import ScoreSheet from '../score/ScoreSheet';

export default {
  title: 'Score/ScoreSheet',
  component: ScoreSheet,
};

const players = {
  player1: { name: 'Alice', score: 42 },
  player2: { name: 'Bob', score: 37 },
};

const gameHistory = [
  { player: 1, word: 'HELLO', points: 8, time: '2025-06-22T12:00:00Z' },
  { player: 2, word: 'WORLD', points: 10, time: '2025-06-22T12:01:00Z' },
];

const getWinStats = (playerKey) => ({ totalWins: 3, currentStreak: 2, hasFlame: playerKey === 'player1' });

export const Default = () => (
  <ScoreSheet players={players} gameHistory={gameHistory} getWinStats={getWinStats} />
);
