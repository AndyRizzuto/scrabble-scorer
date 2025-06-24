import React, { useEffect, useState } from 'react';
import { CheckCircle, Plus, Zap } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  type?: 'word-added' | 'turn-completed' | 'bingo';
  message?: string;
  points?: number;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  onComplete,
  type = 'word-added',
  message,
  points
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'stay' | 'exit'>('enter');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setPhase('enter');
      
      // Enter phase (0.3s) -> Stay phase (1.2s) -> Exit phase (0.5s)
      const enterTimer = setTimeout(() => setPhase('stay'), 300);
      const stayTimer = setTimeout(() => setPhase('exit'), 1500);
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(stayTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  const getAnimation = () => {
    switch (type) {
      case 'word-added':
        return {
          icon: <Plus className="w-8 h-8" />,
          color: 'from-green-400 to-blue-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'turn-completed':
        return {
          icon: <CheckCircle className="w-8 h-8" />,
          color: 'from-blue-400 to-purple-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'bingo':
        return {
          icon: <Zap className="w-8 h-8" />,
          color: 'from-yellow-400 to-orange-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          icon: <CheckCircle className="w-8 h-8" />,
          color: 'from-green-400 to-blue-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
    }
  };

  const animation = getAnimation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className={`
          transform transition-all duration-300 ease-out
          ${phase === 'enter' ? 'scale-0 opacity-0 translate-y-4' : ''}
          ${phase === 'stay' ? 'scale-100 opacity-100 translate-y-0' : ''}
          ${phase === 'exit' ? 'scale-110 opacity-0 translate-y-2' : ''}
        `}
      >
        <div className={`
          ${animation.bgColor} ${animation.borderColor} 
          border-2 rounded-2xl p-6 shadow-2xl backdrop-blur-sm
          flex flex-col items-center gap-3 min-w-[200px]
        `}>
          {/* Animated Icon */}
          <div className={`
            bg-gradient-to-r ${animation.color} 
            text-white rounded-full p-3 shadow-lg
            ${phase === 'stay' ? 'animate-pulse' : ''}
          `}>
            {animation.icon}
          </div>
          
          {/* Message */}
          <div className="text-center">
            <div className="font-semibold text-gray-800 text-lg">
              {message || (type === 'word-added' ? 'Word Added!' : 
                          type === 'turn-completed' ? 'Turn Complete!' : 
                          'Bingo!')}
            </div>
            {points && (
              <div className="text-sm text-gray-600 mt-1">
                +{points} points
              </div>
            )}
          </div>
          
          {/* Decorative elements */}
          {type === 'bingo' && (
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
              🎉
            </div>
          )}
        </div>
      </div>
      
      {/* Background overlay */}
      <div className={`
        fixed inset-0 bg-black transition-opacity duration-300
        ${phase === 'enter' ? 'opacity-0' : ''}
        ${phase === 'stay' ? 'opacity-5' : ''}
        ${phase === 'exit' ? 'opacity-0' : ''}
      `} />
    </div>
  );
};

export default SuccessAnimation;