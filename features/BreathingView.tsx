
import React, { useState, useEffect, useRef } from 'react';
import { Wind, Heart, Box, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { BreathingPattern } from '../types';

// Patterns Definition
const PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    nameKey: 'box',
    descKey: 'box',
    benefitKey: 'box',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4
  },
  {
    id: 'relax',
    nameKey: 'relax',
    descKey: 'relax',
    benefitKey: 'relax',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0
  },
  {
    id: 'coherence',
    nameKey: 'coherence',
    descKey: 'coherence',
    benefitKey: 'coherence',
    inhale: 5.5,
    holdIn: 0,
    exhale: 5.5,
    holdOut: 0
  }
];

export const BreathingView: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);

  if (selectedPattern) {
    return (
      <BreathingVisualizer 
        pattern={selectedPattern} 
        onClose={() => setSelectedPattern(null)} 
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">{t.breathing.title}</h2>
        <p className="text-slate-500">{t.breathing.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {PATTERNS.map((pattern) => {
            // Mapping keys to translation object
            const cardT = t.breathing.cards[pattern.nameKey as keyof typeof t.breathing.cards];
            const icon = pattern.id === 'box' ? Box : pattern.id === 'relax' ? Wind : Heart;
            
            return (
                <div key={pattern.id} onClick={() => setSelectedPattern(pattern)} className="cursor-pointer">
                    <MethodCard 
                        title={cardT.title}
                        desc={cardT.desc}
                        benefit={cardT.benefit}
                        icon={icon}
                    />
                </div>
            );
        })}
      </div>
    </div>
  );
};

const MethodCard: React.FC<{ title: string; desc: string; benefit: string; icon: any }> = ({ title, desc, benefit, icon: Icon }) => (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#d62828]/10 hover:border-[#d62828]/30 group h-full">
        <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-[#d62828]/10 text-[#d62828] group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                    {desc}
                </p>
                <div className="flex items-center gap-2 pt-2">
                    <Badge color="red">{benefit}</Badge>
                </div>
            </div>
        </div>
    </Card>
);

// --- VISUALIZER COMPONENT ---

interface VisualizerProps {
  pattern: BreathingPattern;
  onClose: () => void;
}

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

const BreathingVisualizer: React.FC<VisualizerProps> = ({ pattern, onClose }) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  
  // Animation State
  const [ringProgress, setRingProgress] = useState(0); // 0 = empty, 100 = full
  const [duration, setDuration] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activityTimeoutRef = useRef<number | null>(null);

  // SVG Config (Identical to TimerView)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke offset based on progress
  // progress 0 -> offset = circumference (empty)
  // progress 100 -> offset = 0 (full)
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

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

  const runPhase = (nextPhase: Phase) => {
    let phaseDuration = 0;
    let nextPhaseName: Phase = 'inhale';
    let targetProgress = 0;

    switch (nextPhase) {
      case 'inhale':
        phaseDuration = pattern.inhale;
        nextPhaseName = 'holdIn';
        targetProgress = 100; // Fill up
        break;
      case 'holdIn':
        phaseDuration = pattern.holdIn;
        nextPhaseName = 'exhale';
        targetProgress = 100; // Stay full
        break;
      case 'exhale':
        phaseDuration = pattern.exhale;
        nextPhaseName = 'holdOut';
        targetProgress = 0; // Empty
        break;
      case 'holdOut':
        phaseDuration = pattern.holdOut;
        nextPhaseName = 'inhale';
        targetProgress = 0; // Stay empty
        break;
    }

    // Skip 0 duration phases
    if (phaseDuration <= 0) {
      runPhase(nextPhaseName);
      return;
    }

    setPhase(nextPhase);
    setDuration(phaseDuration);
    
    // Small delay to ensure CSS transition picks up the new duration
    requestAnimationFrame(() => {
        setRingProgress(targetProgress);
    });

    timerRef.current = window.setTimeout(() => {
        runPhase(nextPhaseName);
    }, phaseDuration * 1000);
  };

  useEffect(() => {
    // Initial start: Set to empty, then trigger inhale
    setRingProgress(0);
    setDuration(0);
    
    // Start loop
    requestAnimationFrame(() => {
        runPhase('inhale');
    });

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getInstructionText = () => {
      switch(phase) {
          case 'inhale': return t.breathing.instructions.inhale;
          case 'holdIn': return t.breathing.instructions.hold;
          case 'exhale': return t.breathing.instructions.exhale;
          case 'holdOut': return t.breathing.instructions.hold;
      }
  };

  return (
    <div 
        ref={containerRef}
        className={`
            group flex flex-col items-center justify-center relative select-none bg-slate-50 transition-all duration-500 ease-in-out
            ${isZenMode 
                ? 'fixed inset-0 z-[100] w-screen h-screen justify-center items-center overflow-hidden' 
                : 'min-h-full w-full max-w-lg mx-auto py-8 px-4 justify-center animate-fade-in'
            }
        `}
    >
        
        {/* Controls Overlay */}
        <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between z-50 transition-opacity duration-500 ${isZenMode && !isUserActive ? 'opacity-0' : 'opacity-100'}`}>
            <button 
                onClick={onClose}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
            </button>

            <button 
                onClick={toggleZenMode}
                className={`p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#d62828] transition-all duration-300 ${isZenMode ? 'bg-white shadow-sm' : ''}`}
                title={isZenMode ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center relative">
            <div className="relative group/timer">
                
                {/* Aura / Glow Effect - Synced with Ring */}
                <div 
                    className={`
                        absolute inset-0 rounded-full blur-[60px] transition-all
                        ${phase === 'inhale' || phase === 'holdIn' ? 'bg-[#d62828] opacity-60 scale-110' : 'bg-[#d62828] opacity-20 scale-90'}
                    `}
                    style={{ transitionDuration: `${duration}s`, transitionTimingFunction: 'ease-in-out' }}
                />

                <svg viewBox="0 0 340 340" className="w-72 h-72 md:w-96 md:h-96 transform -rotate-90 relative z-10">
                  {/* Glassy Track */}
                  <circle 
                    cx="170" cy="170" r={radius} 
                    stroke="#e2e8f0" 
                    strokeWidth="2" 
                    fill="rgba(255,255,255,0.5)" 
                    className="backdrop-blur-sm"
                  />
                  
                  {/* Progress Ring */}
                  <circle
                    cx="170"
                    cy="170"
                    r={radius}
                    stroke="#d62828"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all ease-linear"
                    style={{ transitionDuration: `${duration}s` }}
                  />
                </svg>
                
                {/* Central Text */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-20">
                    <span 
                        key={phase} // Triggers animation on change
                        className="text-2xl md:text-3xl font-light tracking-[0.2em] text-slate-800 uppercase animate-fade-in"
                    >
                        {getInstructionText()}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};