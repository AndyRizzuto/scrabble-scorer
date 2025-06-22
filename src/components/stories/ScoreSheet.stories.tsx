import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScoreSheet from '../score/ScoreSheet';

const meta: Meta<typeof ScoreSheet> = {
  title: 'Score/ScoreSheet',
  component: ScoreSheet,
  parameters: {
    docs: {
      description: {
        component: 'ScoreSheet displays the full game score sheet for both players, including win stats and game history.'
      }
    }
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ScoreSheet>;

const players = {
  player1: { name: 'Alice', score: 42 },
  player2: { name: 'Bob', score: 37 },
};

const gameHistory = [
  { player: 1, word: 'HELLO', points: 8, time: '2025-06-22T12:00:00Z' },
  { player: 2, word: 'WORLD', points: 10, time: '2025-06-22T12:01:00Z' },
];

const getWinStats = (playerKey: 'player1' | 'player2') => ({ totalWins: 3, currentStreak: 2, hasFlame: playerKey === 'player1' });

export const Default: Story = {
  args: {
    players,
    gameHistory,
    getWinStats,
  },
  parameters: {
    docs: {
      source: {
        code: `<ScoreSheet players={players} gameHistory={gameHistory} getWinStats={getWinStats} />`,
      },
    },
  },
};
