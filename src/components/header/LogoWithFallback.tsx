import React from 'react';

const LogoWithFallback: React.FC = () => {
  const [showFallback, setShowFallback] = React.useState(false);
  return showFallback ? (
    <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-700 drop-shadow-lg">SKOREBORED</span>
  ) : (
    <img
      src="/logo.svg"
      alt="SKOREBORED"
      className="h-16 sm:h-24 w-auto max-w-xs mx-auto drop-shadow-xl"
      style={{ minHeight: 48 }}
      onError={() => setShowFallback(true)}
      draggable={false}
    />
  );
};

export default LogoWithFallback;
