
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Music2, Volume2, ChevronDown, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
import { Slider } from '../components/ui';
import { TimerMode, Session, TimerTechnique, AmbientSoundType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TimerViewProps {
  onSessionComplete: (session: Session) => void;
}

// Configuration for different productivity techniques
const TECHNIQUES_CONFIG: Record<TimerTechnique, { config: Record<TimerMode, number> }> = {
  POMODORO: {
    config: { [TimerMode.FOCUS]: 25, [TimerMode.SHORT_BREAK]: 5, [TimerMode.LONG_BREAK]: 15 }
  },
  FIFTY_TWO: {
    config: { [TimerMode.FOCUS]: 52, [TimerMode.SHORT_BREAK]: 17, [TimerMode.LONG_BREAK]: 17 }
  },
  NINETY: {
    config: { [TimerMode.FOCUS]: 90, [TimerMode.SHORT_BREAK]: 20, [TimerMode.LONG_BREAK]: 20 }
  },
  CUSTOM: {
    config: { [TimerMode.FOCUS]: 45, [TimerMode.SHORT_BREAK]: 10, [TimerMode.LONG_BREAK]: 20 }
  }
};

const SOUNDS: Record<AmbientSoundType, { label: string; url: string }> = {
  NONE: { label: 'Off', url: '' },
  RAIN: { label: 'Heavy Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  FOREST: { label: 'Ocean Waves', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  CAFE: { label: 'Coffee Shop', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' }
};

export const TimerView: React.FC<TimerViewProps> = ({ onSessionComplete }) => {
  const { t } = useLanguage(); // Consume Context

  const [technique, setTechnique] = useState<TimerTechnique>('POMODORO');
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [customConfig, setCustomConfig] = useState(TECHNIQUES_CONFIG.CUSTOM.config);
  
  // Audio State
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('NONE');
  const [volume, setVolume] = useState(0.5);
  const [showSoundControls, setShowSoundControls] = useState(false);
  const [showTechniqueMenu, setShowTechniqueMenu] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activityTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to get translated labels
  const getTechniqueLabel = (key: TimerTechnique) => {
    switch (key) {
        case 'POMODORO': return t.methods.cards.pomodoro.title;
        case 'FIFTY_TWO': return t.methods.cards.fiftyTwo.title;
        case 'NINETY': return t.methods.cards.ultradian.title;
        case 'CUSTOM': return t.timer.technique.custom;
        default: return key;
    }
  };
  
  const getDuration = useCallback(() => {
    if (technique === 'CUSTOM') return customConfig[mode] * 60;
    return TECHNIQUES_CONFIG[technique].config[mode] * 60;
  }, [technique, mode, customConfig]);

  const [timeLeft, setTimeLeft] = useState(getDuration());
  const [isActive, setIsActive] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [interruptions, setInterruptions] = useState(0);

  // Native Fullscreen & Activity Tracker
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsZenMode(false);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    if (!isZenMode) {
        setIsUserActive(true);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }

    const handleMouseMove = () => {
        setIsUserActive(true);
        if (activityTimeoutRef.current) {
            window.clearTimeout(activityTimeoutRef.current);
        }
        activityTimeoutRef.current = window.setTimeout(() => {
            setIsUserActive(false);
        }, 2000);
    };

    handleMouseMove();
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if (activityTimeoutRef.current) window.clearTimeout(activityTimeoutRef.current);
    };
  }, [isZenMode]);

  useEffect(() => {
    setIsActive(false);
    setTimeLeft(getDuration());
    setInterruptions(0);
  }, [technique, mode, getDuration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const soundUrl = SOUNDS[selectedSound].url;

    if (selectedSound === 'NONE') {
      audio.pause();
      audio.currentTime = 0;
    } else if (audio.src !== soundUrl) {
      audio.src = soundUrl;
      audio.load();
    }

    if (isActive && selectedSound !== 'NONE') {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.debug("Audio autoplay prevented:", error));
      }
    } else {
      audio.pause();
    }
  }, [isActive, selectedSound]);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    onSessionComplete({
      id: crypto.randomUUID(),
      duration: getDuration(),
      timestamp: Date.now(),
      mode,
      completedAt: new Date().toISOString(),
      interruptions: interruptions
    });
    setTimeLeft(getDuration());
    setInterruptions(0);
  }, [mode, getDuration, onSessionComplete, interruptions]);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCustomTimeSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const minutes = parseInt(editValue, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 240) {
      setCustomConfig(prev => ({ ...prev, [mode]: minutes }));
      if (technique !== 'CUSTOM') setTechnique('CUSTOM');
    }
    setIsEditingTime(false);
  };

  const startEditing = () => {
    if (isActive) return;
    setEditValue(Math.floor(timeLeft / 60).toString());
    setIsEditingTime(true);
  };

  const toggleTimer = () => {
    if (isActive) {
        setInterruptions(prev => prev + 1);
    }
    setIsEditingTime(false);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
      setIsActive(false);
      setTimeLeft(getDuration());
      setInterruptions(0);
  };

  const toggleZenMode = async () => {
      if (!isZenMode) {
          if (containerRef.current) {
              try {
                  await containerRef.current.requestFullscreen();
              } catch (err) {
                  console.error("Error attempting to enable fullscreen:", err);
              }
          }
          setIsZenMode(true);
      } else {
          if (document.fullscreenElement) {
              try {
                await document.exitFullscreen();
              } catch (err) {
                console.error("Error attempting to exit fullscreen:", err);
              }
          }
          setIsZenMode(false);
      }
  };

  const totalTime = getDuration();
  const timeRatio = totalTime > 0 ? timeLeft / totalTime : 0;
  // Inverse ratio: 0 at start, 1 at end.
  const inverseRatio = 1 - timeRatio;
  
  return (
    <div 
        ref={containerRef}
        className={`
            group flex flex-col items-center justify-between relative overflow-hidden transition-all duration-500 ease-in-out h-full w-full select-none
            ${isZenMode ? 'fixed inset-0 z-[100] bg-slate-50 w-screen h-screen' : ''}
        `}
    >
      
      <audio ref={audioRef} loop crossOrigin="anonymous" />

      {/* Extreme Corner Button: Zen Mode */}
      <button 
        onClick={toggleZenMode}
        className={`
            absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#d62828] transition-all duration-300 z-50 
            ${isZenMode ? `bg-white shadow-sm transition-opacity duration-500 ${isUserActive ? 'opacity-100' : 'opacity-0'}` : ''}
        `}
        title={t.timer.controls.zen}
      >
        {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      {/* 1. TOP SECTION - Flexible Header */}
      <div className={`flex-none flex flex-col items-center gap-4 w-full pt-6 pb-2 px-4 transition-all duration-500 z-40 ${isZenMode ? 'hidden' : 'flex'}`}>
         
         <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner w-full max-w-sm">
            {(Object.values(TimerMode)).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  mode === m 
                    ? 'bg-white text-[#d62828] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.timer.modes[m]}
              </button>
            ))}
         </div>

         <div className="relative z-30">
            <button 
                onClick={() => setShowTechniqueMenu(!showTechniqueMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
                <span>{getTechniqueLabel(technique)}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTechniqueMenu ? 'rotate-180' : ''}`} />
            </button>

            {showTechniqueMenu && (
                <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTechniqueMenu(false)} />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] z-40">
                  <div className="absolute left-1/2 -translate-x-1/2 w-full">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-fade-in-up origin-top">
                        {Object.keys(TECHNIQUES_CONFIG).map((key) => {
                            const techKey = key as TimerTechnique;
                            return (
                                <button
                                    key={techKey}
                                    onClick={() => {
                                        setTechnique(techKey);
                                        setShowTechniqueMenu(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex justify-between items-center ${
                                        technique === techKey 
                                        ? 'bg-[#d62828]/10 text-[#d62828] font-medium' 
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {getTechniqueLabel(techKey)}
                                    {technique === techKey && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            );
                        })}
                      </div>
                  </div>
                </div>
                </>
            )}
         </div>
      </div>

      {/* 2. CENTER SECTION: Hypnotic Timer - Uses min-h-0 and flex-1 to auto-shrink if needed */}
      <div className={`flex-1 min-h-0 flex items-center justify-center relative w-full z-0`}>
        {/* Responsive Sizing: Fits width but bounded by height to prevent scroll. min() ensures it fits both dimensions. */}
        {/* Adjusted to 45vh to ensure room for controls on small landscape screens */}
        <div 
            className="relative group/timer flex items-center justify-center aspect-square w-[min(80vw,45vh)]"
            style={{ containerType: 'inline-size' }}
        >
            
            {/* Hypnotic Aura */}
            {/* Inset-10 creates a buffer so the blur doesn't hit the container edge hard */}
            <div 
                className={`
                    absolute inset-10 rounded-full blur-[60px] bg-[#d62828] transition-all duration-1000 ease-linear z-0
                `}
                style={{
                   // Scale: Starts small (0.6), ends large (1.0)
                   transform: `scale(${0.6 + (inverseRatio * 0.4)})`,
                   // Opacity: Starts strong (0.75), ends faint (0.2) as time runs out
                   opacity: 0.2 + (timeRatio * 0.55)
                }}
            />

            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-20">
              
              {isEditingTime ? (
                <form onSubmit={handleCustomTimeSubmit} className="flex flex-col items-center w-full max-w-[200px]">
                  <input 
                      autoFocus
                      type="number"
                      min="1"
                      max="240"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleCustomTimeSubmit()}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomTimeSubmit()}
                      className="font-light tracking-tighter text-center bg-transparent outline-none caret-[#d62828] leading-none text-slate-50 w-full [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/30 p-0 m-0 border-none focus:ring-0"
                      style={{ fontSize: '22cqi' }}
                      placeholder={t.timer.edit.placeholder}
                  />
                  <span className="text-xs font-semibold text-slate-50/80 animate-fade-in mt-2 uppercase tracking-widest opacity-80 shadow-sm">
                    {t.timer.edit.label}
                  </span>
                </form>
              ) : (
                <div 
                  onClick={startEditing}
                  className={`font-light tracking-tighter tabular-nums text-slate-50 cursor-pointer select-none transition-all hover:scale-105 active:scale-95 ${isActive ? 'pointer-events-none' : ''}`}
                  style={{ fontSize: '22cqi' }}
                  title="Click to edit duration"
                >
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Controls */}
      {/* Sit within Flex flow to prevent overlaps on small screens */}
      <div className={`
          flex-none flex items-center justify-center gap-8 z-30 transition-all duration-700 pb-8
          ${isZenMode 
            ? `transition-opacity duration-700 ${isUserActive ? 'opacity-30 hover:opacity-100' : 'opacity-0 pointer-events-none'}` 
            : 'w-full'
          }
      `}>
          
          {!isZenMode && (
              <button 
                onClick={resetTimer}
                className="group/btn flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
                title={t.timer.controls.reset}
              >
                <RotateCcw className="w-5 h-5 group-hover/btn:-rotate-180 transition-transform duration-500" />
              </button>
          )}
          
          <button 
            onClick={toggleTimer}
            className={`flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 border border-slate-100 shadow-xl hover:shadow-2xl ${
              isActive 
                ? 'bg-[#d62828]/5 text-[#d62828] border-[#d62828]/20' 
                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-[#d62828]'
            } ${isZenMode ? 'w-14 h-14 bg-white' : 'w-20 h-20'}`}
            title={isActive ? t.timer.controls.pause : t.timer.controls.play}
          >
            {isActive ? <Pause className={`${isZenMode ? 'w-5 h-5' : 'w-8 h-8'} fill-current`} /> : <Play className={`${isZenMode ? 'w-5 h-5' : 'w-8 h-8'} fill-current ml-1`} />}
          </button>

          {!isZenMode && (
              <div className="relative">
                  <button 
                    onClick={() => setShowSoundControls(!showSoundControls)}
                    className={`flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 shadow-sm ${selectedSound !== 'NONE' ? 'text-[#d62828] border-[#d62828]/20 bg-[#d62828]/10' : ''}`}
                    title={t.timer.controls.sound}
                  >
                    <Music2 className="w-5 h-5" />
                  </button>

                  {showSoundControls && (
                      <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowSoundControls(false)}/>
                      <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] z-40">
                        <div className="absolute left-1/2 -translate-x-1/2 w-full">
                          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up origin-bottom">
                            <div className="space-y-0.5 mb-3 p-1">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">{t.timer.controls.sound}</h4>
                                {Object.entries(SOUNDS).map(([key, sound]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedSound(key as AmbientSoundType)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex justify-between items-center ${
                                            selectedSound === key ? 'bg-[#d62828]/10 text-[#d62828] font-medium' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {sound.label}
                                        {selectedSound === key && <Volume2 className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                            <div className="px-3 pb-2 pt-1 border-t border-slate-50">
                                <Slider min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
                            </div>
                          </div>
                        </div>
                      </div>
                      </>
                  )}
              </div>
          )}
      </div>

    </div>
  );
};
