import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ScrabbleScorer from '../ScrabbleScorer';

const meta: Meta<typeof ScrabbleScorer> = {
  title: 'App/ScrabbleScorer',
  component: ScrabbleScorer,
  parameters: {
    docs: {
      description: {
        component: 'The main Scrabble scorekeeping app, including all game logic and UI.'
      }
    }
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ScrabbleScorer>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `<ScrabbleScorer />`,
      },
    },
  },
};
