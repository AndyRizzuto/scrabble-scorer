import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import WordInput from '../WordInput';
import { BonusMultipliers } from '../../types/game';

const meta: Meta<typeof WordInput> = {
  title: 'Tiles/WordInput',
  component: WordInput,
  parameters: {
    docs: {
      description: {
        component: 'WordInput allows entry and scoring of a single word, including multipliers and bingo bonus.',
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof WordInput>;

const defaultMultipliers: BonusMultipliers = { letterMultiplier: 1, wordMultiplier: 1 };

export const Default: Story = {
  args: {
    word: 'TEST',
    points: '8',
    letterMultipliers: [1, 1, 1, 1],
    bonusMultipliers: defaultMultipliers,
    bingoBonus: false,
    tilesUsed: 4,
    onWordChange: () => {},
    onPointsChange: () => {},
    onLetterMultiplierChange: () => {},
    onBonusMultiplierChange: () => {},
    onResetBonuses: () => {},
  },
  parameters: {
    docs: {
      source: {
        code: `<WordInput word="TEST" points="8" letterMultipliers={[1,1,1,1]} bonusMultipliers={{letterMultiplier:1,wordMultiplier:1}} bingoBonus={false} tilesUsed={4} ... />`,
      },
    },
  },
};
