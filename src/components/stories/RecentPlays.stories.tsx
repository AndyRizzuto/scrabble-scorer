import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RecentPlays from '../score/RecentPlays';

const meta: Meta<typeof RecentPlays> = {
  title: 'Score/RecentPlays',
  component: RecentPlays,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Displays the most recent plays grouped by turn, with breakdowns for word, bonuses, and totals. Supports undo and reset actions.',
      },
    },
  },
  argTypes: {
    onResetGame: { action: 'reset game' },
    onUndoTurn: { action: 'undo turn' },
  },
};
export default meta;

type Story = StoryObj<typeof RecentPlays>;

export const Default: Story = {
  args: {
    recentPlays: [
      { player: 1, word: 'HELLO', points: 8, time: '2025-06-22T12:00:00Z' },
      { player: 2, word: 'WORLD', points: 10, time: '2025-06-22T12:01:00Z' },
    ],
    players: { player1: { name: 'Alice' }, player2: { name: 'Bob' } },
  },
};

export const MultiWordTurn: Story = {
  args: {
    recentPlays: [
      { player: 1, word: 'QUIZ', points: 22, time: '2025-06-22T12:02:00Z' },
      { player: 1, word: 'AX', points: 18, time: '2025-06-22T12:02:00Z' },
      { player: 2, word: 'JAZZ', points: 29, time: '2025-06-22T12:03:00Z' },
    ],
    players: { player1: { name: 'Alice' }, player2: { name: 'Bob' } },
  },
};

export const WithBonuses: Story = {
  args: {
    recentPlays: [
      {
        player: 1,
        word: 'QUIZZED',
        points: 86,
        time: '2025-06-22T12:04:00Z',
        bonuses: {
            wordMultiplier: 3,
            letterMultiplier: 0
        },
        letterMultipliers: [1, 1, 1, 2, 1, 1, 1],
        bingoBonus: true,
      },
      {
        player: 2,
        word: 'OX',
        points: 9,
        time: '2025-06-22T12:05:00Z',
        bonuses: { wordMultiplier: 2, letterMultiplier: 1 },
        letterMultipliers: [1, 2],
        bingoBonus: false,
      },
    ],
    players: { player1: { name: 'Alice' }, player2: { name: 'Bob' } },
  },
};

export const Empty: Story = {
  args: {
    recentPlays: [],
    players: { player1: { name: 'Alice' }, player2: { name: 'Bob' } },
  },
};
