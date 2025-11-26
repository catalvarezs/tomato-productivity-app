
import React from 'react';
import { Zap, Wind, Brain, Clock, Battery, Target } from 'lucide-react';
import { Card, Badge } from '../components/ui';

export const MethodsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Techniques</h2>
        <p className="text-slate-500">Discover the science behind the rhythms.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Pomodoro */}
        <MethodCard 
          title="Pomodoro Technique"
          timing="25m Focus / 5m Break"
          icon={Zap}
          description="The classic time management method developed by Francesco Cirillo. It uses a timer to break work into intervals, separated by short breaks."
          bestFor="Procrastination, starting new tasks, and maintaining high intensity on boring chores."
        />

        {/* 52/17 Flow */}
        <MethodCard 
          title="52/17 Flow"
          timing="52m Focus / 17m Break"
          icon={Wind}
          description="Derived from a study by DeskTime, this ratio was found to be the habit of the top 10% most productive employees. It treats energy like a battery."
          bestFor="Deep work sessions, cognitive tasks, and maximizing long-term energy throughout the day."
        />

        {/* Ultradian */}
        <MethodCard 
          title="Ultradian Rhythm"
          timing="90m Focus / 20m Break"
          icon={Brain}
          description="Based on the human body's natural biological cycles (BRAC). Our brains can only maintain intense focus for about 90 minutes before needing a reset."
          bestFor="Complex problem solving, coding, writing, and creative work that requires immersion."
        />

      </div>

      <div className="bg-[#d62828]/5 border border-[#d62828]/10 rounded-2xl p-6 mt-8">
        <h3 className="text-[#d62828] font-bold mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Why use a timer?
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
            Parkinson's Law states that "work expands to fill the time available for its completion." 
            By setting strict time boundaries, you force your brain to focus, reduce decision fatigue, 
            and create a sense of urgency that boosts productivity while preventing burnout.
        </p>
      </div>
    </div>
  );
};

interface MethodCardProps {
    title: string;
    timing: string;
    icon: React.FC<any>;
    description: string;
    bestFor: string;
}

const MethodCard: React.FC<MethodCardProps> = ({ title, timing, icon: Icon, description, bestFor }) => (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#d62828]/10 hover:border-[#d62828]/30 group">
        <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-[#d62828]/10 text-[#d62828] group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <Badge color="slate">{timing}</Badge>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                    {description}
                </p>
                <div className="flex items-start gap-2 pt-2">
                    <Battery className="w-4 h-4 text-[#d62828] mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 font-medium">
                        <span className="text-slate-700">Best for:</span> {bestFor}
                    </p>
                </div>
            </div>
        </div>
    </Card>
);
