import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import HeaderControls from '../header/HeaderControls';

const meta: Meta<typeof HeaderControls> = {
  title: 'Header/HeaderControls',
  component: HeaderControls,
  parameters: {
    docs: {
      description: {
        component: 'HeaderControls provides essential game controls including switch turn, clear tiles, and tile bag access.',
      },
    },
  },
  argTypes: {
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
    onSwitchTurn: { action: 'switch turn' },
    onClearTiles: { action: 'clear tiles' },
    onShowTileModal: { action: 'show tile modal' },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof HeaderControls>;

export const Default: Story = {
  args: {
    canSwitchTurn: true,
    usedTiles: 7,
    tilesRemaining: 91,
    GameTimer: <span>⏱️ 02:34</span>,
  },
};

export const TurnDisabled: Story = {
  args: {
    canSwitchTurn: false,
    usedTiles: 14,
    tilesRemaining: 84,
    GameTimer: <span>⏱️ 05:42</span>,
  },
};

export const LowTiles: Story = {
  args: {
    canSwitchTurn: true,
    usedTiles: 95,
    tilesRemaining: 3,
    GameTimer: <span>⏱️ 12:58</span>,
  },
};

export const NoTilesLeft: Story = {
  args: {
    canSwitchTurn: true,
    usedTiles: 98,
    tilesRemaining: 0,
    GameTimer: <span>⏱️ 18:45</span>,
  },
};
