import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TurnTimer from '../score/TurnTimer';

const meta: Meta<typeof TurnTimer> = {
  title: 'Score/TurnTimer',
  component: TurnTimer,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TurnTimer>;

export const Default: Story = {
  args: {
    isActive: true,
    currentPlayer: 1,
    turnStartTime: Date.now() - 30000,
    minimal: false,
  },
};
