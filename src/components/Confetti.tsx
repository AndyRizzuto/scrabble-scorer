import React from 'react';

const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <div className="text-4xl animate-bounce">🎉🎊✨</div>
    </div>
  );
};

export default Confetti;
