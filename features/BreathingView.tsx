
import React, { useState, useEffect, useRef } from 'react';
import { Wind, Heart, Box, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { BreathingPattern } from '../types';

// Helper Component defined before use to prevent ReferenceError
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
            // Safe access to translation keys
            const cardKey = pattern.nameKey as keyof typeof t.breathing.cards;
            const cardT = t.breathing.cards[cardKey] || { title: pattern.id, desc: '', benefit: '' };
            
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
  const [duration, setDuration] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activityTimeoutRef = useRef<number | null>(null);

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

    switch (nextPhase) {
      case 'inhale':
        phaseDuration = pattern.inhale;
        nextPhaseName = 'holdIn';
        break;
      case 'holdIn':
        phaseDuration = pattern.holdIn;
        nextPhaseName = 'exhale';
        break;
      case 'exhale':
        phaseDuration = pattern.exhale;
        nextPhaseName = 'holdOut';
        break;
      case 'holdOut':
        phaseDuration = pattern.holdOut;
        nextPhaseName = 'inhale';
        break;
    }

    // Skip 0 duration phases
    if (phaseDuration <= 0) {
      runPhase(nextPhaseName);
      return;
    }

    setPhase(nextPhase);
    setDuration(phaseDuration);
    
    timerRef.current = window.setTimeout(() => {
        runPhase(nextPhaseName);
    }, phaseDuration * 1000);
  };

  useEffect(() => {
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

  // Logic for visualizer state
  // Inhale/HoldIn = Expanded (Full)
  // Exhale/HoldOut = Contracted (Empty)
  const isExpanded = phase === 'inhale' || phase === 'holdIn';

  return (
    <div 
        ref={containerRef}
        className={`
            group flex flex-col items-center justify-between relative select-none bg-slate-50 transition-all duration-500 ease-in-out h-full w-full overflow-hidden
            ${isZenMode ? 'fixed inset-0 z-[100] w-screen h-screen' : ''}
        `}
    >
        
        {/* Controls: Extreme Top Left */}
        <button 
            onClick={onClose}
            className={`
                absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-300 z-50
                ${isZenMode && !isUserActive ? 'opacity-0' : 'opacity-100'}
            `}
            title="Back"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Controls: Extreme Top Right */}
        <button 
            onClick={toggleZenMode}
            className={`
                absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#d62828] transition-all duration-300 z-50
                ${isZenMode ? `bg-white shadow-sm ${!isUserActive ? 'opacity-0' : 'opacity-100'}` : ''}
            `}
            title={isZenMode ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
            {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Center Content - Matches TimerView Dimensions & Logic */}
        <div className={`flex-1 min-h-0 flex items-center justify-center relative w-full z-0`}>
            {/* Responsive Sizing: Fits width but bounded by height to prevent scroll. min() ensures it fits both dimensions. */}
            {/* Adjusted to 45vh to prevent corner overlaps on landscape mobile */}
            <div 
                className="relative flex items-center justify-center aspect-square w-[min(80vw,45vh)]"
                style={{ containerType: 'inline-size' } as React.CSSProperties}
            >
                
                {/* Hypnotic Aura: Matches Timer Physics */}
                {/* Inset-10 creates buffer so blur doesn't clip */}
                <div 
                    className={`
                        absolute inset-10 rounded-full blur-[50px] bg-[#d62828] transition-all ease-in-out z-0
                    `}
                    style={{ 
                        transitionDuration: `${duration}s`,
                        transform: `scale(${isExpanded ? 1 : 0.6})`,
                        opacity: isExpanded ? 0.75 : 0.2
                    }}
                />
                
                {/* Central Text - Matches Timer Typography */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-20">
                    <span 
                        key={phase} // Triggers animation on change
                        className="font-light tracking-tighter text-slate-50 select-none animate-fade-in"
                        style={{ fontSize: '22cqi' }}
                    >
                        {getInstructionText()}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};
