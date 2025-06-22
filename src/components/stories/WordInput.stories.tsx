import React from 'react';
import WordInput from '../WordInput';
import { BonusMultipliers } from '../../types/game';

export default {
  title: 'Tiles/WordInput',
  component: WordInput,
};

const defaultMultipliers: BonusMultipliers = { letterMultiplier: 1, wordMultiplier: 1 };

export const Default = () => (
  <WordInput
    word="TEST"
    points="8"
    letterMultipliers={[1, 1, 1, 1]}
    bonusMultipliers={defaultMultipliers}
    bingoBonus={false}
    tilesUsed={4}
    onWordChange={() => {}}
    onPointsChange={() => {}}
    onLetterMultiplierChange={() => {}}
    onBonusMultiplierChange={() => {}}
    onResetBonuses={() => {}}
  />
);
