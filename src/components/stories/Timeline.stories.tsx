import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Timeline from '../game/Timeline';
import type { GameStatus, WordEntry } from '../../types/game';

const meta: Meta<typeof Timeline> = {
  title: 'Game/Timeline',
  component: Timeline,
  parameters: {
    docs: {
      description: {
        component: 'Timeline displays game history, player statistics, and allows starting new games. Shows win streaks and game durations.',
      },
    },
  },
  argTypes: {
    onCreateGame: { action: 'create new game' },
    onGameClick: { action: 'game clicked' },
    formatDuration: { 
      description: 'Function to format game duration from milliseconds to readable string',
      table: { category: 'Functions' }
    },
    getGameDuration: { 
      description: 'Function to calculate game duration from start/end times',
      table: { category: 'Functions' }
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Timeline>;

const players = {
  player1: { id: 1 as 1, name: 'Alice', score: 42 },
  player2: { id: 2 as 2, name: 'Bob', score: 37 },
};

const gameHistory = [
  { player: 1 as 1, word: 'HELLO', points: 8, time: '2025-06-22T12:00:00Z' },
  { player: 2 as 2, word: 'WORLD', points: 10, time: '2025-06-22T12:01:00Z' },
];

const gameWins = {
  player1: [1],
  player2: [2],
};

const games = [
  {
    id: '1',
    status: 'final' as GameStatus,
    startTime: Date.now() - 1000000,
    pausedTime: 0,
    players,
    gameHistory,
    winner: 1 as 1,
    currentPlayer: 1 as 1,
    currentTurnWords: [] as WordEntry[],
    tilesRemaining: 50,
  },
  {
    id: '2',
    status: 'active' as GameStatus,
    startTime: Date.now(),
    pausedTime: 0,
    players,
    gameHistory,
    winner: null,
    currentPlayer: 2 as 2,
    currentTurnWords: [] as WordEntry[],
    tilesRemaining: 42,
  },
];

export const Default: Story = {
  args: {
    players,
    gameHistory,
    gameWins,
    games,
    onCreateGame: () => {},
    onGameClick: () => {},
    formatDuration: (ms: number) => `${Math.round(ms / 1000)}s`,
    getGameDuration: () => 123456,
  },
};
