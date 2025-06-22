import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ResponsiveTimer from '../score/ResponsiveTimer';

const meta: Meta<typeof ResponsiveTimer> = {
  title: 'Score/ResponsiveTimer',
  component: ResponsiveTimer,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ResponsiveTimer>;

export const Default: Story = {
  args: {
    isActive: true,
    currentPlayer: 1,
  },
};
