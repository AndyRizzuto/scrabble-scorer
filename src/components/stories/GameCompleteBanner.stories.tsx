import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import GameCompleteBanner from '../game/GameCompleteBanner';

const meta: Meta<typeof GameCompleteBanner> = {
  title: 'Game/GameCompleteBanner',
  component: GameCompleteBanner,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof GameCompleteBanner>;

export const Default: Story = {
  args: {
    winner: 1,
  },
};
