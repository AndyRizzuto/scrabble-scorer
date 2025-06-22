import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RecentPlays from '../score/RecentPlays';

const meta: Meta<typeof RecentPlays> = {
  title: 'Score/RecentPlays',
  component: RecentPlays,
  tags: ['autodocs'],
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
    onResetGame: () => {},
    onUndoTurn: () => {},
  },
};
