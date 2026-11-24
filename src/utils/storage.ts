import { Goal, Task, ThemeId } from '../types';
import { addDaysISO, getTodayISO, getWeekDates } from './dateUtils';

const TASKS_KEY = 'my_tasks_app_tasks_v1';
const GOALS_KEY = 'my_tasks_app_goals_v1';
const THEME_KEY = 'my_tasks_app_theme_v1';
const INITIALIZED_KEY = 'my_tasks_app_initialized_v1';

export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Health', 'Home', 'Study'];

function createSeedTasks(): Task[] {
  const today = getTodayISO();
  const week = getWeekDates(0);
  const nowISO = new Date().toISOString();

  // Ensure tasks land neatly across the current week + one upcoming next week
  const mon = week[0].iso;
  const tue = week[1].iso;
  const wed = week[2].iso;
  const thu = week[3].iso;
  const fri = week[4].iso;
  const sat = week[5].iso;
  const sun = week[6].iso;

  return [
    {
      id: 'seed-1',
      title: 'Finalize Q4 design review deck',
      description:
        'Polish typography slides, update user research summary, and export PDF notes before team sync.',
      dueDate: today,
      priority: 'High',
      category: 'Work',
      status: 'In Progress',
      createdAt: nowISO,
    },
    {
      id: 'seed-2',
      title: 'Morning Pilates & stretch session',
      description: '35-minute mobility routine focusing on posture and lower back release.',
      dueDate: today,
      priority: 'Medium',
      category: 'Health',
      status: 'Completed',
      createdAt: nowISO,
      completedAt: nowISO,
    },
    {
      id: 'seed-3',
      title: 'Pick up oat milk, sourdough & fresh herbs',
      description: 'Stop by the neighborhood market on the way home for dinner prep.',
      dueDate: today,
      priority: 'Low',
      category: 'Home',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-4',
      title: 'Weekly inbox & calendar triage',
      description: 'Clear unread client threads, confirm Thursday meeting slots, and archive receipts.',
      dueDate: mon,
      priority: 'Medium',
      category: 'Work',
      status: 'Completed',
      createdAt: nowISO,
      completedAt: nowISO,
    },
    {
      id: 'seed-5',
      title: 'Read Chapter 4 of Design Systems Handbook',
      description: 'Take structured notes on token naming conventions and contrast scales.',
      dueDate: tue,
      priority: 'Low',
      category: 'Study',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-6',
      title: 'Prepare monthly budget & savings transfer',
      description: 'Review recurring subscriptions and allocate automated transfer to travel fund.',
      dueDate: wed,
      priority: 'High',
      category: 'Personal',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-7',
      title: 'Water indoor plants & repot monstera',
      description: 'Check soil moisture levels and refresh terracotta pot drainage.',
      dueDate: thu,
      priority: 'Low',
      category: 'Home',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-8',
      title: 'Send sprint retrospective notes',
      description: 'Summarize action items and tag owners in shared workspace.',
      dueDate: fri,
      priority: 'Medium',
      category: 'Work',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-9',
      title: 'Saturday farmer’s market & coffee walk',
      description: 'Slow morning walk and pick up seasonal flowers for the living room.',
      dueDate: sat,
      priority: 'Low',
      category: 'Personal',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-10',
      title: 'Plan meals & prep lunches for next week',
      description: 'Draft 4 simple recipes and roast vegetables for Monday–Wednesday.',
      dueDate: sun,
      priority: 'Medium',
      category: 'Health',
      status: 'Pending',
      createdAt: nowISO,
    },
    {
      id: 'seed-11',
      title: 'Book annual dental checkup',
      description: 'Call clinic reception for a morning appointment next month.',
      dueDate: addDaysISO(today, 4),
      priority: 'Medium',
      category: 'Health',
      status: 'Pending',
      createdAt: nowISO,
    },
  ];
}

function createSeedGoals(): Goal[] {
  const nowISO = new Date().toISOString();
  return [
    {
      id: 'goal-1',
      title: 'Complete deep-work morning blocks',
      description: 'Protect 90 minutes of distraction-free creative work every weekday.',
      timeframe: 'Monthly',
      current: 14,
      target: 20,
      unit: 'sessions',
      category: 'Work',
      createdAt: nowISO,
    },
    {
      id: 'goal-2',
      title: 'Mindful movement & Pilates days',
      description: 'Consistent low-impact workouts and evening walks.',
      timeframe: 'Monthly',
      current: 11,
      target: 16,
      unit: 'days',
      category: 'Health',
      createdAt: nowISO,
    },
    {
      id: 'goal-3',
      title: 'Read 18 books this year',
      description: 'Mix of design, essays, and literary fiction before bedtime.',
      timeframe: 'Yearly',
      current: 13,
      target: 18,
      unit: 'books',
      category: 'Personal',
      createdAt: nowISO,
    },
    {
      id: 'goal-4',
      title: 'Build emergency & travel savings reserve',
      description: 'Steady monthly contributions toward annual financial target.',
      timeframe: 'Yearly',
      current: 8,
      target: 12,
      unit: 'milestones',
      category: 'Personal',
      createdAt: nowISO,
    },
  ];
}

export function loadInitialData(): {
  tasks: Task[];
  goals: Goal[];
  theme: ThemeId;
} {
  try {
    const initialized = localStorage.getItem(INITIALIZED_KEY);
    const savedTheme = (localStorage.getItem(THEME_KEY) as ThemeId | null) || 'ivory';

    if (!initialized) {
      const seedTasks = createSeedTasks();
      const seedGoals = createSeedGoals();
      localStorage.setItem(TASKS_KEY, JSON.stringify(seedTasks));
      localStorage.setItem(GOALS_KEY, JSON.stringify(seedGoals));
      localStorage.setItem(THEME_KEY, savedTheme);
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return { tasks: seedTasks, goals: seedGoals, theme: savedTheme };
    }

    const rawTasks = localStorage.getItem(TASKS_KEY);
    const rawGoals = localStorage.getItem(GOALS_KEY);

    return {
      tasks: rawTasks ? (JSON.parse(rawTasks) as Task[]) : [],
      goals: rawGoals ? (JSON.parse(rawGoals) as Goal[]) : [],
      theme: savedTheme,
    };
  } catch {
    return {
      tasks: createSeedTasks(),
      goals: createSeedGoals(),
      theme: 'ivory',
    };
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch {
    // Storage quota unavailable
  }
}

export function saveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch {
    // Storage quota unavailable
  }
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage quota unavailable
  }
}
