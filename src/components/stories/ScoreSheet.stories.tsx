import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScoreSheet from '../score/ScoreSheet';

const meta: Meta<typeof ScoreSheet> = {
  title: 'Score/ScoreSheet',
  component: ScoreSheet,
  parameters: {
    docs: {
      description: {
        component: 'ScoreSheet displays the full game score sheet for both players, including win stats, game history, and game controls.'
      }
    }
  },
  argTypes: {
    editingScores: {
      control: 'boolean',
      description: 'Whether score editing mode is active',
    },
    gameStatus: {
      control: 'select',
      options: ['active', 'paused', 'final'],
      description: 'Current game status',
    },
    onToggleEditScores: { action: 'toggle edit scores' },
    onEndGame: { action: 'end game' },
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
    editingScores: false,
    gameStatus: 'active',
  },
};

export const WithControls: Story = {
  args: {
    players,
    gameHistory,
    getWinStats,
    editingScores: false,
    gameStatus: 'active',
  },
};

export const EditingMode: Story = {
  args: {
    players,
    gameHistory,
    getWinStats,
    editingScores: true,
    gameStatus: 'active',
  },
};

export const GameCompleted: Story = {
  args: {
    players,
    gameHistory,
    getWinStats,
    editingScores: false,
    gameStatus: 'final',
  },
};

export const EmptyHistory: Story = {
  args: {
    players: {
      player1: { name: 'Alice', score: 0 },
      player2: { name: 'Bob', score: 0 },
    },
    gameHistory: [],
    getWinStats,
    editingScores: false,
    gameStatus: 'active',
  },
};
