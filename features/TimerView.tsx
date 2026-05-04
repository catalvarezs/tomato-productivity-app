
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Music2, Volume2, ChevronDown, CheckCircle2, Maximize2, Minimize2, CloudRain, Trees, Coffee, VolumeX, SkipBack, SkipForward, LogOut, ExternalLink } from 'lucide-react';
import { Slider } from '../components/ui';
import { TimerMode, Session, TimerTechnique, AmbientSoundType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpotify } from '../contexts/SpotifyContext';

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

const SOUNDS: Record<AmbientSoundType, { label: string; url: string; icon: any }> = {
  NONE: { label: 'Silent', url: '', icon: VolumeX },
  RAIN: { label: 'Heavy Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', icon: CloudRain },
  FOREST: { label: 'Ocean Waves', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg', icon: Trees },
  CAFE: { label: 'Coffee Shop', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg', icon: Coffee }
};

// ─── Spotify icon SVG ────────────────────────────────────────────────────────

const SpotifyIcon = ({ size = 16, color = '#1DB954' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

// ─── Spotify Panel ────────────────────────────────────────────────────────────

const SpotifyPanel: React.FC = () => {
  const spotify = useSpotify();
  const [clientIdInput, setClientIdInput] = useState(spotify.clientId);
  const [showSetup, setShowSetup] = useState(false);
  const [uriInput, setUriInput] = useState('');

  const needsSetup = !spotify.clientId;

  if (needsSetup || showSetup) {
    return (
      <div className="p-1 space-y-3">
        <div className="flex items-center gap-2 px-2 pt-1">
          <SpotifyIcon size={14} />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configurar Spotify</span>
        </div>
        <div className="px-2 space-y-2">
          <p className="text-xs text-slate-500 leading-relaxed">
            Necesitas un <strong>Client ID</strong> de{' '}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#1DB954] underline inline-flex items-center gap-0.5">developer.spotify.com <ExternalLink className="w-2.5 h-2.5" /></a>.
            Añade <code className="bg-slate-100 px-1 rounded text-[10px]">{window.location.origin}</code> como Redirect URI.
          </p>
          <input
            type="text"
            value={clientIdInput}
            onChange={e => setClientIdInput(e.target.value)}
            placeholder="Client ID de Spotify..."
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]/20 text-slate-700 placeholder:text-slate-400 transition-all"
          />
          <button
            onClick={() => { spotify.setClientId(clientIdInput); setShowSetup(false); }}
            disabled={!clientIdInput.trim()}
            className="w-full py-2 rounded-xl bg-[#1DB954] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#18a349] active:scale-95 transition-all"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  if (!spotify.isConnected) {
    return (
      <div className="p-1 space-y-3">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <SpotifyIcon size={14} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spotify</span>
          </div>
          <button onClick={() => setShowSetup(true)} className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">Cambiar ID</button>
        </div>
        <div className="px-2 pb-1 space-y-2">
          <p className="text-xs text-slate-500">Conecta tu cuenta <strong>Spotify Premium</strong> para escuchar música mientras te concentras.</p>
          <button
            onClick={spotify.login}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1DB954] text-white text-sm font-semibold hover:bg-[#18a349] active:scale-95 transition-all"
          >
            <SpotifyIcon size={16} color="#fff" />
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  // Connected state
  const { isReady, isPlaying, currentTrack, trackProgress, volume } = spotify;

  return (
    <div className="p-1 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <SpotifyIcon size={14} />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spotify</span>
        </div>
        <button onClick={spotify.logout} className="p-1 text-slate-400 hover:text-slate-600 transition-colors" title="Desconectar">
          <LogOut className="w-3 h-3" />
        </button>
      </div>

      {/* Track info */}
      {currentTrack ? (
        <div className="px-2 flex items-center gap-3">
          {currentTrack.albumArt ? (
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.name}
              className="w-10 h-10 rounded-lg flex-shrink-0 object-cover shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
              <SpotifyIcon size={18} color="#94a3b8" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{currentTrack.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentTrack.artist}</p>
          </div>
        </div>
      ) : (
        <div className="px-2">
          {isReady ? (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500">Dispositivo listo. Reproduce desde Spotify y el control aparecerá aquí.</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={uriInput}
                  onChange={e => setUriInput(e.target.value)}
                  placeholder="spotify:playlist:..."
                  className="flex-1 text-[10px] px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#1DB954] text-slate-700 placeholder:text-slate-400 transition-all"
                />
                <button
                  onClick={() => uriInput.startsWith('spotify:') && spotify.playUri(uriInput)}
                  disabled={!uriInput.startsWith('spotify:')}
                  className="px-2 py-1.5 rounded-lg bg-[#1DB954] text-white text-[10px] font-semibold disabled:opacity-40 hover:bg-[#18a349] transition-all"
                >
                  Play
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Iniciando reproductor…</p>
          )}
        </div>
      )}

      {/* Progress bar */}
      {currentTrack && (
        <div className="px-2">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1DB954] transition-all duration-300"
              style={{ width: `${trackProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-2 pb-1">
        <button onClick={spotify.previous} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors active:scale-90">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={spotify.togglePlay}
          disabled={!isReady}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1DB954] text-white disabled:opacity-40 hover:bg-[#18a349] active:scale-95 transition-all shadow-md shadow-[#1DB954]/20"
        >
          {isPlaying
            ? <Pause className="w-4 h-4 fill-white" />
            : <Play className="w-4 h-4 fill-white ml-0.5" />
          }
        </button>
        <button onClick={spotify.next} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors active:scale-90">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Volume */}
      <div className="px-3 pb-1 border-t border-slate-50 pt-2">
        <Slider min={0} max={1} step={0.01} value={volume} onChange={e => spotify.setVolume(parseFloat(e.target.value))} />
      </div>
    </div>
  );
};

// ─── Timer View ───────────────────────────────────────────────────────────────

export const TimerView: React.FC<TimerViewProps> = ({ onSessionComplete }) => {
  const { t } = useLanguage();
  const spotify = useSpotify();

  const [technique, setTechnique] = useState<TimerTechnique>('POMODORO');
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [customConfig, setCustomConfig] = useState(TECHNIQUES_CONFIG.CUSTOM.config);

  // Audio State
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('NONE');
  const [volume, setVolume] = useState(0.5);
  const [showSoundControls, setShowSoundControls] = useState(false);
  const [soundTab, setSoundTab] = useState<'ambient' | 'spotify'>('ambient');
  const [showTechniqueMenu, setShowTechniqueMenu] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activityTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const soundMenuRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll sound menu into view
  useEffect(() => {
    if (showSoundControls && soundMenuRef.current) {
        // Short delay to allow render
        setTimeout(() => {
            soundMenuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 150);
    }
  }, [showSoundControls]);

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
            group flex flex-col items-center justify-between relative transition-all duration-500 ease-in-out min-h-full w-full select-none
            ${isZenMode ? 'fixed inset-0 z-[100] bg-slate-50 w-screen h-screen overflow-y-auto' : ''}
        `}
    >
      
      <audio ref={audioRef} loop crossOrigin="anonymous" />

      {/* Floating Button: Exit Zen Mode (Only visible in Zen Mode) */}
      {isZenMode && (
        <button 
            onClick={toggleZenMode}
            className={`
                absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#d62828] transition-all duration-300 z-50 bg-white shadow-sm
                ${isUserActive ? 'opacity-100' : 'opacity-0'}
            `}
            title={t.timer.controls.zen}
        >
            <Minimize2 className="w-5 h-5" />
        </button>
      )}

      {/* 1. TOP SECTION - Flexible Header */}
      {/* Removed pt-6 to align flush with top, closer to logo */}
      <div className={`relative flex-none flex flex-col items-center gap-4 w-full pt-0 pb-2 px-4 transition-all duration-500 z-20 ${isZenMode ? 'hidden' : 'flex'}`}>
         
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

         <div className="flex items-center gap-2 z-20">
            <div className="relative">
                <button 
                    onClick={() => setShowTechniqueMenu(!showTechniqueMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <span>{getTechniqueLabel(technique)}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showTechniqueMenu ? 'rotate-180' : ''}`} />
                </button>

                {showTechniqueMenu && (
                    <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowTechniqueMenu(false)} />
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] z-30">
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

            {/* Enter Zen Mode Button (Integrated in Header) */}
            <button 
                onClick={toggleZenMode}
                className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-[#d62828] hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                title={t.timer.controls.zen}
            >
                <Maximize2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* 2. CENTER SECTION: Hypnotic Timer - Uses min-h-0 and flex-1 to auto-shrink if needed */}
      <div className={`flex-1 min-h-0 flex items-center justify-center relative w-full z-0`}>
        {/* Responsive Sizing: Fits width but bounded by height to prevent scroll. min() ensures it fits both dimensions. */}
        {/* Adjusted to 45vh to ensure room for controls on small landscape screens */}
        <div 
            className="relative group/timer flex items-center justify-center aspect-square w-[min(80vw,45vh)]"
            style={{ containerType: 'inline-size' } as any}
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
                      className="font-light tracking-tighter text-center bg-transparent outline-none caret-transparent leading-none text-slate-50 w-full [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/30 p-0 m-0 border-none focus:ring-0 drop-shadow-none"
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
      {/* Reverted pb-24 to pb-8 to lower buttons back down */}
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
                    className={`
                        flex items-center justify-center w-14 h-14 rounded-full border transition-all active:scale-95 shadow-sm
                        ${spotify.isPlaying
                            ? 'bg-[#1DB954]/5 border-[#1DB954]/30 text-[#1DB954]'
                            : selectedSound !== 'NONE'
                            ? 'bg-[#d62828]/5 border-[#d62828]/20 text-[#d62828]'
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-200'
                        }
                    `}
                    title={t.timer.controls.sound}
                  >
                    {spotify.isPlaying
                      ? <SpotifyIcon size={20} color="#1DB954" />
                      : <Music2 className="w-5 h-5" />
                    }
                  </button>

                  {showSoundControls && (
                      <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowSoundControls(false)}/>
                      <div ref={soundMenuRef} className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-72 max-w-[calc(100vw-2rem)] z-40">
                        <div className="absolute left-1/2 -translate-x-1/2 w-full">
                          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up origin-top overflow-hidden">

                            {/* Tab switcher */}
                            <div className="flex border-b border-slate-100">
                              <button
                                onClick={() => setSoundTab('ambient')}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                                  soundTab === 'ambient'
                                    ? 'text-[#d62828] border-b-2 border-[#d62828] bg-[#d62828]/5'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <Music2 className="w-3.5 h-3.5" />
                                Ambiente
                              </button>
                              <button
                                onClick={() => setSoundTab('spotify')}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                                  soundTab === 'spotify'
                                    ? 'text-[#1DB954] border-b-2 border-[#1DB954] bg-[#1DB954]/5'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <SpotifyIcon size={13} color={soundTab === 'spotify' ? '#1DB954' : '#94a3b8'} />
                                Spotify
                              </button>
                            </div>

                            {/* Tab content */}
                            {soundTab === 'ambient' ? (
                              <div className="p-2">
                                <div className="space-y-0.5 mb-3 p-1">
                                    <div className="flex items-center justify-between mb-2 px-2">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.timer.controls.sound}</h4>
                                        <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded-md">{Math.round(volume * 100)}%</span>
                                    </div>
                                    {Object.entries(SOUNDS).map(([key, sound]) => {
                                        const SoundIcon = sound.icon;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedSound(key as AmbientSoundType)}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex justify-between items-center ${
                                                    selectedSound === key ? 'bg-[#d62828]/10 text-[#d62828] font-medium' : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <SoundIcon className="w-4 h-4 opacity-70" />
                                                    <span>{sound.label}</span>
                                                </div>
                                                {selectedSound === key && <Volume2 className="w-4 h-4" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="px-3 pb-2 pt-1 border-t border-slate-50">
                                    <Slider min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
                                </div>
                              </div>
                            ) : (
                              <SpotifyPanel />
                            )}
                          </div>
                        </div>
                      </div>
                      </>
                  )}
              </div>
          )}
      </div>
      
      {/* Spacer to allow scrolling when sound menu is open */}
      {showSoundControls && <div className="h-72 w-full flex-none transition-all" />}

    </div>
  );
};