import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SuccessAnimation from '../SuccessAnimation';

const meta: Meta<typeof SuccessAnimation> = {
  title: 'Animations/SuccessAnimation',
  component: SuccessAnimation,
  parameters: {
    docs: {
      description: {
        component: 'SuccessAnimation provides full-screen celebration animations for word additions, turn completions, and bingo achievements.',
      },
    },
  },
  argTypes: {
    show: {
      control: 'boolean',
      description: 'Whether to show the animation',
    },
    type: {
      control: 'select',
      options: ['word-added', 'turn-completed', 'bingo'],
      description: 'Type of success animation to display',
    },
    message: {
      control: 'text',
      description: 'Custom message to display (optional)',
    },
    points: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Points to display with the animation',
    },
    onComplete: { action: 'animation completed' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SuccessAnimation>;

export const WordAdded: Story = {
  args: {
    show: true,
    type: 'word-added',
    points: 15,
  },
};

export const TurnCompleted: Story = {
  args: {
    show: true,
    type: 'turn-completed',
    points: 42,
  },
};

export const Bingo: Story = {
  args: {
    show: true,
    type: 'bingo',
    points: 67,
  },
};

export const CustomMessage: Story = {
  args: {
    show: true,
    type: 'word-added',
    message: 'Amazing Word!',
    points: 28,
  },
};

export const Hidden: Story = {
  args: {
    show: false,
    type: 'word-added',
    points: 15,
  },
};