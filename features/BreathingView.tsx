
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [phase, setPhase] = useState<Phase>('inhale');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  
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

  // Generate 3D Donut Point Cloud (Torus)
  const particles = useMemo(() => {
    const skipCenter = 150; // Larger hole for Donut shape
    const numPoints = 800; // Increased density for 3D effect
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); 
    const spread = 8; 
    
    return Array.from({ length: numPoints }).map((_, i) => {
      const index = i + skipCenter;
      
      // Radius calculation
      const dist = spread * Math.sqrt(index); 
      const theta = index * goldenAngle;
      
      const cx = dist * Math.cos(theta);
      const cy = dist * Math.sin(theta);
      
      // Size Gradient: Larger on outside
      // Min size 2px, Max size 12px
      const normalizedDist = (dist - (spread * Math.sqrt(skipCenter))) / (spread * Math.sqrt(numPoints + skipCenter));
      const r = 2 + (normalizedDist * 10);
      
      // Opacity Gradient for 3D depth
      const opacity = 0.2 + (normalizedDist * 0.8);

      return { id: i, cx, cy, r, opacity };
    });
  }, []);

  // Recursive function to handle phases and skip 0-duration ones
  const runPhase = (nextPhase: Phase) => {
    let duration = 0;
    let followingPhase: Phase = 'inhale';

    switch (nextPhase) {
      case 'inhale':
        duration = pattern.inhale;
        followingPhase = 'holdIn';
        break;
      case 'holdIn':
        duration = pattern.holdIn;
        followingPhase = 'exhale';
        break;
      case 'exhale':
        duration = pattern.exhale;
        followingPhase = 'holdOut';
        break;
      case 'holdOut':
        duration = pattern.holdOut;
        followingPhase = 'inhale';
        break;
    }

    // CRITICAL: If a phase has 0 duration (like holdIn in Coherence), skip it immediately
    if (duration <= 0) {
      runPhase(followingPhase);
      return;
    }

    setPhase(nextPhase);

    timerRef.current = window.setTimeout(() => {
        runPhase(followingPhase);
    }, duration * 1000);
  };

  useEffect(() => {
    runPhase('inhale');
    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getDynamicStyle = (): React.CSSProperties => {
      const isExpanded = phase === 'inhale' || phase === 'holdIn';
      
      let duration = 0;
      switch(phase) {
          case 'inhale': duration = pattern.inhale; break;
          case 'holdIn': duration = pattern.holdIn; break;
          case 'exhale': duration = pattern.exhale; break;
          case 'holdOut': duration = pattern.holdOut; break;
      }

      // We add a slight rotation drift to holds so it doesn't look frozen
      let rotation = '0deg';
      let scale = '1';

      if (phase === 'inhale') {
          rotation = '0deg';
          scale = '1';
      } else if (phase === 'holdIn') {
          rotation = '5deg'; // Slow drift during hold
          scale = '1';
      } else if (phase === 'exhale') {
          rotation = '90deg'; // Spiral close
          scale = '0.45'; // Tight contraction
      } else if (phase === 'holdOut') {
          rotation = '100deg'; // Slow drift during hold empty
          scale = '0.45';
      }

      return {
        transitionProperty: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Apple-like ease
        transitionDuration: `${duration}s`,
        transform: `scale(${scale}) rotate(${rotation})`,
      };
  };

  const style = getDynamicStyle();

  // Define viewbox size
  const size = 600;
  const viewBox = `-${size/2} -${size/2} ${size} ${size}`;

  return (
    <div 
        ref={containerRef}
        className={`
            flex flex-col items-center justify-center relative animate-fade-in overflow-hidden select-none bg-slate-50 transition-all duration-500
            ${isZenMode ? 'fixed inset-0 z-[100] w-screen h-screen' : 'h-full w-full'}
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

        {/* 3D Torus Container */}
        <div className="relative flex items-center justify-center w-full h-full perspective-[1000px]">
            <div 
                className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center will-change-transform"
                style={style}
            >
                <svg 
                    width="100%" 
                    height="100%" 
                    viewBox={viewBox} 
                    className="overflow-visible"
                    style={{ filter: 'drop-shadow(0px 20px 40px rgba(214, 40, 40, 0.4))' }}
                >
                    {particles.map(p => (
                        <circle 
                            key={p.id}
                            cx={p.cx}
                            cy={p.cy}
                            r={p.r}
                            fill="#d62828"
                            fillOpacity={p.opacity}
                        />
                    ))}
                </svg>
            </div>
        </div>
    </div>
  );
};
