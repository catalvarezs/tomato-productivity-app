
import React, { useState } from 'react';
import { Timer, CheckSquare, BookOpen, Menu, X } from 'lucide-react';
import { AppView, AppState, Session, TaskStatus } from './types';
import { usePersistedState } from './hooks/usePersistedState';
import { TimerView } from './features/TimerView';
import { TasksView } from './features/TasksView';
import { MethodsView } from './features/MethodsView';

const INITIAL_STATE: AppState = {
  tasks: [
    { id: '1', title: 'Welcome to Tomato', status: TaskStatus.TODO, createdAt: Date.now(), tags: [] },
    { id: '2', title: 'Start your first focus session', status: TaskStatus.TODO, createdAt: Date.now(), tags: [] }
  ],
  sessions: []
};

// Custom Tomato Icon
const TomatoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14z" />
    <path d="M12 9c-1.5-2.5-4-3-4-3" />
    <path d="M12 9c1.5-2.5 4-3 4-3" />
    <path d="M12 9V3" />
    <path d="M12 5h4" />
  </svg>
);

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.TIMER);
  const [tasks, setTasks] = usePersistedState('tomato_tasks', INITIAL_STATE.tasks);
  const [sessions, setSessions] = usePersistedState('tomato_sessions', INITIAL_STATE.sessions);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSessionComplete = (session: Session) => {
    setSessions(prev => [...prev, session]);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.TIMER:
        return <TimerView onSessionComplete={handleSessionComplete} />;
      case AppView.TASKS:
        return <TasksView tasks={tasks} setTasks={setTasks} />;
      case AppView.METHODS:
        return <MethodsView />;
      default:
        return <TimerView onSessionComplete={handleSessionComplete} />;
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden selection:bg-[#d62828]/20 selection:text-[#d62828]">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 text-[#d62828]">
           <TomatoIcon className="w-6 h-6" />
           <span className="font-bold text-lg tracking-tight">Tomato</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation - Responsive */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out w-64
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center gap-3 mb-10 px-2 text-[#d62828]">
            <div className="bg-[#d62828]/10 p-2 rounded-xl">
               <TomatoIcon className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">Tomato</span>
          </div>

          <nav className="space-y-2 flex-1 mt-16 md:mt-0">
            <NavItem 
              active={currentView === AppView.TIMER} 
              onClick={() => { setCurrentView(AppView.TIMER); closeMobileMenu(); }} 
              icon={Timer} 
              label="Timer"
            />
            <NavItem 
              active={currentView === AppView.TASKS} 
              onClick={() => { setCurrentView(AppView.TASKS); closeMobileMenu(); }} 
              icon={CheckSquare} 
              label="Tasks"
            />
            <NavItem 
              active={currentView === AppView.METHODS} 
              onClick={() => { setCurrentView(AppView.METHODS); closeMobileMenu(); }} 
              icon={BookOpen} 
              label="Methods"
            />
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-100">
             <a 
               href="https://github.com/catalvarezs" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-xs text-slate-400 text-center block hover:text-[#d62828] transition-colors"
             >
               Code by Catalina • v1.1.0
             </a>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-5xl mx-auto h-full flex flex-col animate-fade-in-up">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active 
        ? 'bg-[#d62828]/10 text-[#d62828] shadow-sm translate-x-1' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
    <span>{label}</span>
  </button>
);
