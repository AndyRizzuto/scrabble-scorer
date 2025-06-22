import React from 'react';

interface TimelinePageProps {
  players: any;
  gameHistory: any[];
  getWinStats: (playerKey: 'player1' | 'player2') => any;
}

const TimelinePage: React.FC<TimelinePageProps> = ({ players, gameHistory, getWinStats }) => (
  <div>
    {/* Place your timeline/score sheet UI here */}
    Timeline goes here.
  </div>
);

export default TimelinePage;