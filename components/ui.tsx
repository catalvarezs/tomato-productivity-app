import React from 'react';

/**
 * Card Component
 * A layout primitive for grouping content with a consistent background and border.
 */
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
    {children}
  </div>
);

/**
 * Badge Component
 * Used for status indicators and counts.
 * Currently unified to the Primary Red (#d62828) or Neutral Slate.
 */
export const Badge: React.FC<{ children: React.ReactNode; color?: 'red' | 'green' | 'slate' | 'amber' }> = ({ children, color = 'slate' }) => {
  const colors = {
    red: 'bg-[#d62828]/10 text-[#d62828] ring-[#d62828]/20',
    green: 'bg-[#d62828]/10 text-[#d62828] ring-[#d62828]/20',
    slate: 'bg-slate-50 text-slate-700 ring-slate-600/10',
    amber: 'bg-[#d62828]/10 text-[#d62828] ring-[#d62828]/20',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[color]}`}>
      {children}
    </span>
  );
};

/**
 * Slider Component
 * Custom styled range input for volume control.
 */
export const Slider: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    type="range"
    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d62828] hover:accent-[#b91c1c] transition-all"
    {...props}
  />
);