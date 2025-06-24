import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import HeaderControls from '../header/HeaderControls';

const meta: Meta<typeof HeaderControls> = {
  title: 'Header/HeaderControls',
  component: HeaderControls,
  parameters: {
    docs: {
      description: {
        component: 'HeaderControls provides game control buttons including edit scores, switch turn, and tile bag access.',
      },
    },
  },
  argTypes: {
    editingScores: {
      control: 'boolean',
      description: 'Whether score editing mode is active',
    },
    canSwitchTurn: {
      control: 'boolean',
      description: 'Whether the turn switch button should be enabled',
    },
    usedTiles: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Number of tiles used so far',
    },
    tilesRemaining: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Number of tiles remaining in the bag',
    },
    onToggleEditScores: { action: 'toggle edit scores' },
    onSwitchTurn: { action: 'switch turn' },
    onShowTileModal: { action: 'show tile modal' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof HeaderControls>;

export const Default: Story = {
  args: {
    editingScores: false,
    canSwitchTurn: true,
    usedTiles: 7,
    tilesRemaining: 91,
    ResponsiveTimer: <span>⏱️ 02:34</span>,
  },
};

export const EditingScores: Story = {
  args: {
    editingScores: true,
    canSwitchTurn: false,
    usedTiles: 14,
    tilesRemaining: 84,
    ResponsiveTimer: <span>⏱️ 05:42</span>,
  },
};

export const TurnDisabled: Story = {
  args: {
    editingScores: false,
    canSwitchTurn: false,
    usedTiles: 21,
    tilesRemaining: 77,
    ResponsiveTimer: <span>⏱️ 01:15</span>,
  },
};

export const LowTiles: Story = {
  args: {
    editingScores: false,
    canSwitchTurn: true,
    usedTiles: 95,
    tilesRemaining: 3,
    ResponsiveTimer: <span>⏱️ 12:58</span>,
  },
};
