
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '../components/ui';
import { Session, TimerMode } from '../types';
import { Clock, Zap, Coffee, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  sessions: Session[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessions }) => {
  // --- Data Processing ---

  // 1. Filter Sessions by Type
  const focusSessions = sessions.filter(s => s.mode === TimerMode.FOCUS);
  const breakSessions = sessions.filter(s => s.mode !== TimerMode.FOCUS);

  // 2. Calculate Totals (Seconds)
  const totalFocusSeconds = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalBreakSeconds = breakSessions.reduce((acc, s) => acc + s.duration, 0);
  
  // 3. Calculate Interruptions
  const totalInterruptions = focusSessions.reduce((acc, s) => acc + (s.interruptions || 0), 0);
  const avgInterruptions = focusSessions.length > 0 ? (totalInterruptions / focusSessions.length).toFixed(1) : '0';

  // 4. Helper for formatting
  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // 5. Calculate "Today" Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySeconds = sessions
    .filter(s => s.completedAt.startsWith(todayStr) && s.mode === TimerMode.FOCUS)
    .reduce((acc, s) => acc + s.duration, 0);

  // 6. Focus Quality Trend (Last 15 Sessions)
  // Logic: 100% Quality = 0 interruptions. Each interruption deducts 10%. Min 0%.
  const qualityData = focusSessions.slice(-15).map((s, i) => {
      const interruptions = s.interruptions || 0;
      const qualityScore = Math.max(0, 100 - (interruptions * 10));
      return {
          id: i + 1,
          quality: qualityScore,
          interruptions: interruptions,
          date: new Date(s.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})
      };
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <header className="px-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Study Analytics</h2>
          <p className="text-slate-500">Analyze your attention span and habits.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-[#d62828]" />
          <span>Today's Focus: <span className="font-bold text-slate-900">{formatDuration(todaySeconds)}</span></span>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Focus Time" 
          value={formatDuration(totalFocusSeconds)} 
          icon={Zap} 
          color="red"
          sublabel="Deep Work"
        />
        <StatCard 
          label="Avg. Interruptions" 
          value={avgInterruptions} 
          icon={AlertCircle} 
          color="amber"
          sublabel="Per Session"
        />
        <StatCard 
          label="Sessions Completed" 
          value={focusSessions.length.toString()} 
          icon={TrendingUp} 
          color="slate"
          sublabel="Cycles"
        />
        <StatCard 
          label="Total Break Time" 
          value={formatDuration(totalBreakSeconds)} 
          icon={Coffee} 
          color="green"
          sublabel="Recharge"
        />
      </div>

      {/* Visualizations Section */}
      <div className="w-full">
        
        {/* Retention / Quality Chart */}
        <Card className="p-6 shadow-sm border-0 ring-1 ring-slate-100 h-96 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#d62828]"></span>
             Focus Retention Quality (Last 15 Sessions)
          </h3>
          <div className="flex-1 w-full min-h-0">
             {qualityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={qualityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d62828" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d62828" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="id" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }} 
                        unit="%"
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                            backgroundColor: '#1e293b',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value}%`, 'Retention Score']}
                        labelFormatter={(label) => `Session #${label}`}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="quality" 
                        stroke="#d62828" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorQuality)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <p>Complete a session to see your quality trend.</p>
                 </div>
             )}
          </div>
        </Card>
      </div>

      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-slate-400 text-xs">
          <strong>Retention Score</strong> is calculated based on session interruptions.<br/>
          Fewer pauses = higher score (100%).
        </p>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  icon: any; 
  sublabel: string;
  color: 'red' | 'green' | 'amber' | 'slate';
}> = ({ label, value, icon: Icon, sublabel, color }) => {
  
  // Mapping everything to uniform Primary (#d62828) or Neutral
  const colorMap = {
    red: 'bg-[#d62828]/10 text-[#d62828]',
    green: 'bg-[#d62828]/10 text-[#d62828]',
    amber: 'bg-[#d62828]/10 text-[#d62828]',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-100 shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
           <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h4>
           <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">{sublabel}</span>
        </div>
      </div>
    </div>
  );
};
