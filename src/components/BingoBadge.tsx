import React from 'react';

interface BingoBadgeProps {
  show: boolean;
  showConfetti: boolean;
}

const BingoBadge: React.FC<BingoBadgeProps> = ({ show, showConfetti }) => {
  if (!show) return null;
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-bold border transition-all duration-300 ${
      showConfetti 
        ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 animate-pulse' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }`}>
      🎉 BINGO! +50
    </div>
  );
};

export default BingoBadge;
