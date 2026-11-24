export type Priority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type NavView =
  | 'dashboard'
  | 'weekly'
  | 'monthly'
  | 'calendar'
  | 'goals'
  | 'completed'
  | 'settings';

export type ThemeId = 'ivory' | 'sage' | 'rose' | 'peach';

export type TimeframeFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  category: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export type GoalTimeframe = 'Monthly' | 'Yearly';

export interface Goal {
  id: string;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  current: number;
  target: number;
  unit: string;
  category: string;
  createdAt: string;
}

export interface ThemePalette {
  id: ThemeId;
  name: string;
  swatch: [string, string, string];
  vars: {
    '--bg-canvas': string;
    '--bg-surface': string;
    '--bg-subtle': string;
    '--bg-hover': string;
    '--border-hairline': string;
    '--border-strong': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-muted': string;
    '--accent-primary': string;
    '--accent-primary-hover': string;
    '--accent-soft': string;
    '--sage': string;
    '--sage-soft': string;
    '--rose': string;
    '--rose-soft': string;
    '--peach': string;
    '--peach-soft': string;
  };
}
