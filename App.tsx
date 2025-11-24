import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, SkipForward, SkipBack, List } from 'lucide-react';
import { BlindLevel, GameState, GameStatus } from './types';
import { DEFAULT_BLINDS } from './constants';
import { soundService } from './services/soundService';
import EditModal from './components/EditModal';

const App: React.FC = () => {
  // --- State ---
  const [blinds, setBlinds] = useState<BlindLevel[]>(DEFAULT_BLINDS);
  const [gameState, setGameState] = useState<GameState>({
    currentLevelIndex: 0,
    timeLeftSeconds: DEFAULT_BLINDS[0].durationMinutes * 60,
    status: GameStatus.IDLE,
    totalElapsedTime: 0
  });
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [showBlindsList, setShowBlindsList] = useState(false);
  
  // Ref for the interval to clear it easily. Using 'number' type for browser compatibility.
  const timerRef = useRef<number | null>(null);

  // --- Helpers ---
  const currentBlind = blinds[gameState.currentLevelIndex];
  const nextBlind = blinds[gameState.currentLevelIndex + 1];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateTotalDuration = () => {
    return blinds.reduce((acc, level) => acc + (level.durationMinutes * 60), 0);
  };

  // --- Game Loop ---
  const tick = useCallback(() => {
    setGameState(prev => {
      // If paused or idle, do nothing (shouldn't happen if interval is cleared, but safety check)
      if (prev.status !== GameStatus.RUNNING) return prev;

      // 1. Level finished?
      if (prev.timeLeftSeconds <= 0) {
        // Move to next level
        const nextIndex = prev.currentLevelIndex + 1;
        
        // Game Over check
        if (nextIndex >= blinds.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, status: GameStatus.IDLE, timeLeftSeconds: 0 };
        }

        // Play Sound
        soundService.playLevelChange();

        return {
          ...prev,
          currentLevelIndex: nextIndex,
          timeLeftSeconds: blinds[nextIndex].durationMinutes * 60,
          totalElapsedTime: prev.totalElapsedTime + 1
        };
      }
      
      // Warning sound at 1 minute
      if (prev.timeLeftSeconds === 60) {
        soundService.playWarning();
      }

      // 2. Decrement
      return {
        ...prev,
        timeLeftSeconds: prev.timeLeftSeconds - 1,
        totalElapsedTime: prev.totalElapsedTime + 1
      };
    });
  }, [blinds]);

  // --- Effects ---
  useEffect(() => {
    if (gameState.status === GameStatus.RUNNING) {
      timerRef.current = window.setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status, tick]);

  // Prevent screen lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn(err);
        }
      }
    };
    if (gameState.status === GameStatus.RUNNING) {
      requestWakeLock();
    }
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [gameState.status]);


  // --- Handlers ---
  const togglePlay = () => {
    // Resume audio context on user interaction
    if (gameState.status === GameStatus.IDLE || gameState.status === GameStatus.PAUSED) {
       soundService.playWarning(); // Little feedback beep and warmup audio
       setGameState(prev => ({ ...prev, status: GameStatus.RUNNING }));
    } else {
       setGameState(prev => ({ ...prev, status: GameStatus.PAUSED }));
    }
  };

  const resetGame = () => {
    if (window.confirm("Reiniciar o timer?")) {
      setGameState({
        currentLevelIndex: 0,
        timeLeftSeconds: blinds[0].durationMinutes * 60,
        status: GameStatus.IDLE,
        totalElapsedTime: 0
      });
    }
  };

  const jumpLevel = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(gameState.currentLevelIndex + 1, blinds.length - 1)
      : Math.max(gameState.currentLevelIndex - 1, 0);
    
    setGameState(prev => ({
      ...prev,
      currentLevelIndex: newIndex,
      timeLeftSeconds: blinds[newIndex].durationMinutes * 60
    }));
  };

  const handleUpdateBlinds = (newBlinds: BlindLevel[]) => {
    setBlinds(newBlinds);
    // Reset current level duration based on the new blind setting if we are currently editing
    const currentMaxTime = newBlinds[gameState.currentLevelIndex]?.durationMinutes * 60 || 0;
    
    setGameState(prev => ({
      ...prev,
      timeLeftSeconds: Math.min(prev.timeLeftSeconds, currentMaxTime) // Don't increase time, just cap if new duration is shorter
    }));
    
    // If the game hasn't started or is just at start, fully reset time
    if (gameState.totalElapsedTime === 0) {
       setGameState(prev => ({
         ...prev,
         timeLeftSeconds: newBlinds[0].durationMinutes * 60
       }));
    }
  };

  // --- Render ---
  const getProgressPercent = () => {
    const totalSeconds = currentBlind.durationMinutes * 60;
    const elapsed = totalSeconds - gameState.timeLeftSeconds;
    return (elapsed / totalSeconds) * 100;
  };

  return (
    <div className="h-[100dvh] bg-poker-dark text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* Top Bar - Minimalist */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-start z-20 pointer-events-none">
         <div className="pointer-events-auto">
            <button onClick={() => setEditModalOpen(true)} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all">
              <Settings size={24} className="text-white" />
            </button>
         </div>
         <div className="pointer-events-auto">
            <button onClick={() => setShowBlindsList(!showBlindsList)} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all">
              <List size={24} className="text-white" />
            </button>
         </div>
      </div>

      {/* Main Timer Area - Maximized for Mobile */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        
        {/* Level Info Group */}
        <div className="flex flex-col items-center justify-center mb-4 md:mb-8 w-full px-4">
            <div className="text-poker-green font-bold tracking-widest uppercase text-sm md:text-xl mb-1">
              NÍVEL {gameState.currentLevelIndex + 1}
            </div>

            <div className="text-center w-full">
              <div className="text-[12vw] md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                {currentBlind.isBreak ? "INTERVALO" : (
                  <>
                    <span className="text-white">{currentBlind.smallBlind}</span>
                    <span className="text-white/40 mx-1 md:mx-2">/</span>
                    <span className="text-white">{currentBlind.bigBlind}</span>
                  </>
                )}
              </div>
              {currentBlind.ante ? (
                <div className="text-xl md:text-3xl text-poker-accent font-bold mt-1">
                  ANTE {currentBlind.ante}
                </div>
              ) : <div className="h-6 md:h-9 mt-1"></div>}
            </div>
        </div>

        {/* Huge Timer Countdown */}
        <div className={`font-mono font-bold tabular-nums leading-none tracking-tight transition-colors duration-300 select-none
            ${gameState.status === GameStatus.PAUSED ? 'text-poker-red opacity-80' : 'text-white'}
            text-[28vw] md:text-[22vw]
          `}>
          {formatTime(gameState.timeLeftSeconds)}
        </div>

        {/* Progress Bar */}
        <div className="w-[80%] max-w-md h-2 bg-white/10 rounded-full overflow-hidden mt-6 md:mt-8">
          <div 
            className="h-full bg-poker-green transition-all duration-1000 ease-linear"
            style={{ width: `${getProgressPercent()}%` }}
          />
        </div>

        {/* Next Level Info (Small at bottom of central area) */}
        <div className="text-center opacity-60 mt-4 md:mt-8">
          <p className="uppercase text-[10px] md:text-xs tracking-wider mb-1">Próximo</p>
          {nextBlind ? (
             <p className="text-lg md:text-xl font-bold">
               {nextBlind.isBreak ? "Intervalo" : `${nextBlind.smallBlind} / ${nextBlind.bigBlind}`}
             </p>
          ) : (
            <p className="text-lg font-bold">Fim</p>
          )}
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="bg-poker-surface/90 backdrop-blur-md p-6 pb-8 border-t border-white/5 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          
          <button onClick={resetGame} className="p-4 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <RotateCcw size={24} />
          </button>
          
          <button onClick={() => jumpLevel('prev')} className="p-4 rounded-full text-white hover:bg-white/10 transition-all">
            <SkipBack size={28} />
          </button>

          <button 
            onClick={togglePlay}
            className={`
              w-20 h-20 flex items-center justify-center rounded-full shadow-lg transform transition-transform active:scale-95
              ${gameState.status === GameStatus.RUNNING 
                ? 'bg-poker-surface border-2 border-poker-red text-poker-red' 
                : 'bg-poker-green text-poker-dark'}
            `}
          >
            {gameState.status === GameStatus.RUNNING ? (
              <Pause size={40} fill="currentColor" />
            ) : (
              <Play size={40} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button onClick={() => jumpLevel('next')} className="p-4 rounded-full text-white hover:bg-white/10 transition-all">
            <SkipForward size={28} />
          </button>

          <div className="w-14"></div> {/* Spacer to balance Reset button */}
        </div>
      </div>

      {/* Slide-over Blind List */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-poker-surface shadow-2xl transform transition-transform duration-300 z-50 flex flex-col border-l border-white/10 ${showBlindsList ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 bg-poker-dark border-b border-white/10 flex justify-between items-center">
          <h2 className="font-bold text-lg">Estrutura</h2>
          <button onClick={() => setShowBlindsList(false)}><Settings size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
           {blinds.map((level, idx) => (
             <div key={idx} className={`p-3 rounded flex justify-between items-center ${idx === gameState.currentLevelIndex ? 'bg-poker-green text-poker-dark font-bold' : 'bg-white/5 text-white/70'}`}>
                <span className="w-8">#{idx + 1}</span>
                <span>{level.smallBlind}/{level.bigBlind} {level.ante ? `(${level.ante})` : ''}</span>
                <span>{level.durationMinutes}m</span>
             </div>
           ))}
        </div>
        <div className="p-4 text-center text-white/30 text-xs">
          Total: {Math.floor(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}m
        </div>
      </div>

      {/* Modals */}
      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        blinds={blinds}
        onSave={handleUpdateBlinds}
      />

    </div>
  );
};

export default App;