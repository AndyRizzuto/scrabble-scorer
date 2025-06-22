import React from 'react';
import GameSetup from '../game/GameSetup';
import { SetupData } from '../../types/game';

export default {
  title: 'Game/GameSetup',
  component: GameSetup,
};

const defaultSetup: SetupData = {
  player1Name: 'Alice',
  player2Name: 'Bob',
  player1Score: 0,
  player2Score: 0,
};

export const Default = () => (
  <GameSetup onSetupSubmit={() => {}} canClose={true} />
);
