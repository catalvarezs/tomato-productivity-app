

export enum AppView {
  TIMER = 'TIMER',
  TASKS = 'TASKS',
  METHODS = 'METHODS',
  BREATHING = 'BREATHING'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export type TimerTechnique = 'POMODORO' | 'FIFTY_TWO' | 'NINETY' | 'CUSTOM';

export type AmbientSoundType = 'NONE' | 'RAIN' | 'FOREST' | 'CAFE';

export type Language = 'en' | 'es' | 'pt' | 'de' | 'ca';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
  tags: string[];
}

export interface Session {
  id: string;
  duration: number; // in seconds
  timestamp: number;
  mode: TimerMode;
  completedAt: string; // ISO Date
  interruptions?: number; // Number of times paused
}

export interface AppState {
  tasks: Task[];
  sessions: Session[];
}

export type TimerConfig = {
  [key in TimerMode]: number; // minutes
};

export interface BreathingPattern {
  id: string;
  nameKey: string; // Key for translation
  descKey: string;
  benefitKey: string;
  inhale: number; // seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
}
export interface AppState {
  tasks: Task[];
  sessions: Session[];
}
