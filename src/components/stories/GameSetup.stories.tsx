import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import GameSetup from '../game/GameSetup';
import { SetupData } from '../../types/game';

const meta: Meta<typeof GameSetup> = {
  title: 'Game/GameSetup',
  component: GameSetup,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
    docs: {
      description: {
        component: 'GameSetup collects player names and starting scores before a game begins.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof GameSetup>;

const defaultSetup: SetupData = {
  player1Name: 'Alice',
  player2Name: 'Bob',
  player1Score: 0,
  player2Score: 0,
};

export const Default: Story = {
  args: {
    onSetupSubmit: () => {},
    canClose: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<GameSetup onSetupSubmit={() => {}} canClose={true} />`,
      },
    },
  },
};
