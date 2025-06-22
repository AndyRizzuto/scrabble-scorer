import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface TurnTimerProps {
  isActive: boolean;
  onTurnEnd?: () => void;
  onTimerExpired?: () => void;
  onTimerPaused?: () => void;
  currentPlayer: 1 | 2;
  turnStartTime?: number;
  minimal?: boolean; // Only show time if true
}

export interface TimerSettings {
  duration: number; // 0 means no duration (stopwatch mode)
  sound: string;
}

const TurnTimer: React.FC<TurnTimerProps> = ({ isActive, onTurnEnd, onTimerExpired, onTimerPaused, currentPlayer, turnStartTime, minimal = false }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    duration: 0, // 0 = stopwatch mode, >0 = countdown mode
    sound: 'alarm'
  });
  
  const intervalRef = useRef<number | undefined>();
  const audioRef = useRef<HTMLAudioElement>();

  const soundOptions = [
    { value: 'alarm', label: 'Alarm Clock' },
    { value: 'foghorn', label: 'Foghorn' },
    { value: 'dog', label: 'Dog Barking' },
    { value: 'fart', label: 'Fart' },
    { value: 'belch', label: 'Belch' },
    { value: 'tires', label: 'Tires Screeching' },
    { value: 'nails', label: 'Nails on Chalkboard' },
    { value: 'klaxon', label: 'Klaxon' }
  ];

  const [previousPlayer, setPreviousPlayer] = useState<1 | 2>(currentPlayer);
  
  // Reset timer when turn changes (currentPlayer changes)
  useEffect(() => {
    if (currentPlayer !== previousPlayer) {
      setTime(0);
      setIsRunning(false);
      setIsPaused(false);
      setPreviousPlayer(currentPlayer);
    }
  }, [currentPlayer, previousPlayer]);

  // Start timer when turn becomes active (only reset time when turn changes, not when resuming)
  useEffect(() => {
    if (isActive && !isPaused && !isRunning) {
      setIsRunning(true);
      if (settings.duration > 0) {
        setTime(settings.duration * 60); // Convert minutes to seconds
      } else if (time === 0) {
        // Only reset to 0 if timer is at 0 (new game scenario)
        setTime(0);
      }
    }
  }, [isActive, settings.duration, isPaused, isRunning, time]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (settings.duration > 0) {
            // Countdown mode
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              setIsRunning(false);
              playSound();
              onTimerExpired?.();
              return 0;
            }
            return newTime;
          } else {
            // Stopwatch mode
            return prevTime + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, settings.duration, onTimerExpired]);

  const playSound = () => {
    // Use actual audio files from freesound.org and other free sources
    const soundUrls = {
      alarm: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      foghorn: 'https://www.soundjay.com/buttons/sounds/ship-horn.wav', 
      dog: 'https://www.soundjay.com/animal/sounds/dog-barking-1.wav',
      fart: 'https://www.soundjay.com/human/sounds/fart-01.wav',
      belch: 'https://www.soundjay.com/human/sounds/burp-1.wav',
      tires: 'https://www.soundjay.com/transportation/sounds/car-skidding-1.wav',
      nails: 'https://www.soundjay.com/misc/sounds/chalkboard-1.wav',
      klaxon: 'https://www.soundjay.com/misc/sounds/air-horn-1.wav'
    };

    // Try to play actual sound file first
    const soundUrl = soundUrls[settings.sound as keyof typeof soundUrls];
    if (soundUrl) {
      const audio = new Audio();
      
      // Set up error handling to fall back to simple beep
      audio.onerror = () => {
        console.log('Could not load sound file, using fallback');
        playFallbackSound();
      };
      
      audio.oncanplaythrough = () => {
        audio.play().catch(() => {
          console.log('Could not play sound, using fallback');
          playFallbackSound();
        });
      };
      
      audio.src = soundUrl;
      audio.volume = 0.7;
      audio.load();
    } else {
      playFallbackSound();
    }
  };

  const playFallbackSound = () => {
    // Simple fallback beep using Web Audio API
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Audio not supported');
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    if (!isRunning) {
      // Start the timer if it's stopped
      setIsRunning(true);
      setIsPaused(false);
    } else {
      // Toggle pause/resume if it's running
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);
      
      // Call onTimerPaused when manually pausing the timer
      if (newPausedState && onTimerPaused) {
        onTimerPaused();
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (settings.duration > 0) {
      setTime(settings.duration * 60);
    } else {
      setTime(0);
    }
  };

  const handleSettingsSubmit = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    handleReset(); // Reset timer with new settings
  };

  const getTimerColor = () => {
    if (!isRunning && !isPaused) return 'text-gray-500';
    if (isPaused) return 'text-yellow-600';
    if (settings.duration > 0 && time <= 30) return 'text-red-600'; // Warning for last 30 seconds
    return 'text-green-600';
  };

  const getTimerIcon = () => {
    if (settings.duration > 0) {
      return time <= 30 && isRunning ? '⏰' : '⏱️';
    }
    return '⏱️';
  };

  if (minimal) {
    // Only show the timer value (mm:ss or stopwatch)
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return (
      <span className="font-mono text-lg">
        {settings.duration > 0
          ? `${minutes}:${seconds.toString().padStart(2, '0')}`
          : `${minutes}:${seconds.toString().padStart(2, '0')}`}
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border hover:bg-gray-50 transition-colors h-12">
        <span className="text-lg">{getTimerIcon()}</span>
        <span className={`font-mono text-sm font-medium ${getTimerColor()}`}>
          {formatTime(time)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={handlePause}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            title={!isRunning || isPaused ? 'Start/Resume' : 'Pause'}
          >
            {!isRunning || isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            title="Timer settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Timer Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turn Duration (minutes, 0 = stopwatch mode)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set to 0 for stopwatch mode, or enter minutes for countdown timer
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timer Sound
                </label>
                <div className="flex gap-2">
                  <select
                    value={settings.sound}
                    onChange={(e) => setSettings(prev => ({ ...prev, sound: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {soundOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => playSound()}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
                    title="Test sound"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSettingsSubmit(settings)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TurnTimer;