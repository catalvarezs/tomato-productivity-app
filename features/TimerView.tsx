
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Brain, Music2, Volume2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Slider } from '../components/ui';
import { TimerMode, Session, TimerTechnique, AmbientSoundType } from '../types';

interface TimerViewProps {
  onSessionComplete: (session: Session) => void;
}

// Configuration for different productivity techniques
const TECHNIQUES: Record<TimerTechnique, { label: string; config: Record<TimerMode, number> }> = {
  POMODORO: {
    label: 'Pomodoro (25/5)',
    config: { [TimerMode.FOCUS]: 25, [TimerMode.SHORT_BREAK]: 5, [TimerMode.LONG_BREAK]: 15 }
  },
  FIFTY_TWO: {
    label: 'Flow (52/17)',
    config: { [TimerMode.FOCUS]: 52, [TimerMode.SHORT_BREAK]: 17, [TimerMode.LONG_BREAK]: 17 }
  },
  NINETY: {
    label: 'Ultradian (90/20)',
    config: { [TimerMode.FOCUS]: 90, [TimerMode.SHORT_BREAK]: 20, [TimerMode.LONG_BREAK]: 20 }
  },
  CUSTOM: {
    label: 'Custom',
    config: { [TimerMode.FOCUS]: 45, [TimerMode.SHORT_BREAK]: 10, [TimerMode.LONG_BREAK]: 20 }
  }
};

const SOUNDS: Record<AmbientSoundType, { label: string; url: string }> = {
  NONE: { label: 'Off', url: '' },
  RAIN: { label: 'Heavy Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  FOREST: { label: 'Ocean Waves', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  CAFE: { label: 'Coffee Shop', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' }
};

// Unified color scheme - all modes use the same primary color #d62828
const MODE_META: Record<TimerMode, { label: string; icon: React.FC<any>; color: string; glow: string }> = {
  [TimerMode.FOCUS]: { label: 'Focus', icon: Zap, color: 'text-[#d62828]', glow: 'shadow-[#d62828]/20' },
  [TimerMode.SHORT_BREAK]: { label: 'Short Break', icon: Coffee, color: 'text-[#d62828]', glow: 'shadow-[#d62828]/20' },
  [TimerMode.LONG_BREAK]: { label: 'Long Break', icon: Brain, color: 'text-[#d62828]', glow: 'shadow-[#d62828]/20' },
};

export const TimerView: React.FC<TimerViewProps> = ({ onSessionComplete }) => {
  const [technique, setTechnique] = useState<TimerTechnique>('POMODORO');
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [customConfig, setCustomConfig] = useState(TECHNIQUES.CUSTOM.config);
  
  // Audio State
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('NONE');
  const [volume, setVolume] = useState(0.5);
  const [showSoundControls, setShowSoundControls] = useState(false);
  const [showTechniqueMenu, setShowTechniqueMenu] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const getDuration = useCallback(() => {
    if (technique === 'CUSTOM') return customConfig[mode] * 60;
    return TECHNIQUES[technique].config[mode] * 60;
  }, [technique, mode, customConfig]);

  const [timeLeft, setTimeLeft] = useState(getDuration());
  const [isActive, setIsActive] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [interruptions, setInterruptions] = useState(0);

  // Reset timer on config change
  useEffect(() => {
    setIsActive(false);
    setTimeLeft(getDuration());
    setInterruptions(0);
  }, [technique, mode, getDuration]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Playback Logic
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

  // Timer Tick
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

  // Visuals
  const totalTime = getDuration();
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const CurrentIcon = MODE_META[mode].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-lg mx-auto gap-8 animate-fade-in py-8 px-4">
      
      <audio ref={audioRef} loop crossOrigin="anonymous" />

      {/* 1. TOP SECTION: Mode Toggles & Technique Strategy */}
      <div className="flex flex-col items-center gap-4 w-full">
         
         {/* Mode Toggles */}
         <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner w-full max-w-sm">
            {(Object.keys(MODE_META) as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  mode === m 
                    ? 'bg-white text-[#d62828] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {MODE_META[m].label}
              </button>
            ))}
         </div>

         {/* Strategy Selector (Custom Dropdown) */}
         <div className="relative z-30">
            <button 
                onClick={() => setShowTechniqueMenu(!showTechniqueMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
                <span>{TECHNIQUES[technique].label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTechniqueMenu ? 'rotate-180' : ''}`} />
            </button>

            {showTechniqueMenu && (
                <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTechniqueMenu(false)} />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] z-40">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-fade-in-up origin-top">
                    {Object.entries(TECHNIQUES).map(([key, tech]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setTechnique(key as TimerTechnique);
                                setShowTechniqueMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex justify-between items-center ${
                                technique === key 
                                ? 'bg-[#d62828]/10 text-[#d62828] font-medium' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {tech.label}
                            {technique === key && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ))}
                  </div>
                </div>
                </>
            )}
         </div>
      </div>

      {/* 2. CENTER SECTION: Timer Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        <div className="relative group">
            
            {/* Dynamic Glow - Uniform Color */}
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 transition-all duration-1000 ${isActive ? 'bg-[#d62828]/50 scale-110' : 'bg-slate-200 scale-90'}`} />

            {/* SVG Timer */}
            <svg viewBox="0 0 340 340" className="w-72 h-72 md:w-96 md:h-96 transform -rotate-90 drop-shadow-2xl relative z-10">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d62828" className="transition-all" />
                  <stop offset="100%" stopColor="#d62828" className="transition-all" />
                </linearGradient>
              </defs>
              <circle
                cx="170"
                cy="170"
                r={radius}
                stroke="#f8fafc"
                strokeWidth="8"
                fill="white"
                className="opacity-100"
              />
              <circle
                cx="170"
                cy="170"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`text-[#d62828] transition-all duration-1000 ease-linear`}
              />
            </svg>
            
            {/* Inner Content */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-20">
              <div className={`p-3 rounded-full bg-slate-50 mb-4 transition-colors duration-500 ${isActive ? 'bg-[#d62828]/10' : ''}`}>
                 <CurrentIcon className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-500 ${isActive ? 'text-[#d62828]' : 'text-slate-400'}`} />
              </div>
              
              {isEditingTime ? (
                <form onSubmit={handleCustomTimeSubmit}>
                  <input 
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleCustomTimeSubmit()}
                      className="text-6xl md:text-8xl font-light w-48 text-center bg-transparent border-b-2 border-[#d62828]/30 focus:border-[#d62828] outline-none text-slate-800"
                  />
                </form>
              ) : (
                <div 
                  onClick={startEditing}
                  className={`text-7xl md:text-8xl font-light tracking-tighter tabular-nums text-slate-800 cursor-pointer select-none transition-all hover:scale-105 ${isActive ? 'pointer-events-none' : ''}`}
                >
                  {formatTime(timeLeft)}
                </div>
              )}

              <p className="text-slate-400 font-medium mt-4 uppercase tracking-widest text-xs md:text-sm h-4">
                {isActive ? (selectedSound !== 'NONE' ? SOUNDS[selectedSound].label : 'Focusing...') : (interruptions > 0 ? `${interruptions} interruption${interruptions > 1 ? 's' : ''}` : 'Ready')}
              </p>
            </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Controls (Centered & Unified) */}
      <div className="flex items-center justify-center gap-8 w-full z-30">
          
          {/* Reset Button */}
          <button 
            onClick={resetTimer}
            className="group flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
          </button>
          
          {/* Play/Pause Button */}
          <button 
            onClick={toggleTimer}
            className={`flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isActive 
                ? 'bg-white border-2 border-slate-100 text-slate-900' 
                : 'bg-[#d62828] text-white shadow-[#d62828]/30'
            }`}
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>

          {/* Sound Control Button (Unified Dropdown) */}
          <div className="relative">
              <button 
                onClick={() => setShowSoundControls(!showSoundControls)}
                className={`flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 shadow-sm ${selectedSound !== 'NONE' ? 'text-[#d62828] border-[#d62828]/20 bg-[#d62828]/10' : ''}`}
                title="Ambient Sound"
              >
                <Music2 className="w-5 h-5" />
              </button>

               {showSoundControls && (
                  <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSoundControls(false)}/>
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] z-40">
                    <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up origin-bottom">
                      <div className="space-y-0.5 mb-3 p-1">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Ambience</h4>
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
                  </>
              )}
          </div>
      </div>

    </div>
  );
};
