

import React from 'react';
import { Zap, Wind, Brain, Battery, Target } from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';

export const MethodsView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">{t.methods.title}</h2>
        <p className="text-slate-500">{t.methods.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Pomodoro */}
        <MethodCard 
          title={t.methods.cards.pomodoro.title}
          timing="25m / 5m"
          icon={Zap}
          description={t.methods.cards.pomodoro.desc}
          bestForLabel={t.methods.bestFor}
          bestFor={t.methods.cards.pomodoro.bestFor}
        />

        {/* 52/17 Flow */}
        <MethodCard 
          title={t.methods.cards.fiftyTwo.title}
          timing="52m / 17m"
          icon={Wind}
          description={t.methods.cards.fiftyTwo.desc}
          bestForLabel={t.methods.bestFor}
          bestFor={t.methods.cards.fiftyTwo.bestFor}
        />

        {/* Ultradian */}
        <MethodCard 
          title={t.methods.cards.ultradian.title}
          timing="90m / 20m"
          icon={Brain}
          description={t.methods.cards.ultradian.desc}
          bestForLabel={t.methods.bestFor}
          bestFor={t.methods.cards.ultradian.bestFor}
        />

      </div>

      <div className="bg-[#d62828]/5 border border-[#d62828]/10 rounded-2xl p-6 mt-8">
        <h3 className="text-[#d62828] font-bold mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t.methods.whyTitle}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
            {t.methods.whyDesc}
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
    bestForLabel: string;
    bestFor: string;
}

const MethodCard: React.FC<MethodCardProps> = ({ title, timing, icon: Icon, description, bestForLabel, bestFor }) => (
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
                        <span className="text-slate-700">{bestForLabel}</span> {bestFor}
                    </p>
                </div>
            </div>
        </div>
    </Card>
);
