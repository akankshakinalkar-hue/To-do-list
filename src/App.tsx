import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { CalendarWidget } from './components/CalendarWidget';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DailyQuoteNote } from './components/DailyQuoteNote';
import { FullCalendarPage } from './components/FullCalendarPage';
import { GoalModal } from './components/GoalModal';
import { GoalsSection } from './components/GoalsSection';
import { Header } from './components/Header';
import { CatMascot, StrawberryMascot } from './components/Mascots';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskModal } from './components/TaskModal';
import { ThemeBannerCard } from './components/ThemeBannerCard';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { applyTheme } from './themes';
import {
  Goal,
  GoalTimeframe,
  NavView,
  Priority,
  StatusFilter,
  Task,
  TaskStatus,
  ThemeId,
  TimeframeFilter,
} from './types';
import {
  getTodayISO,
  getWeekDates,
  isDateInCurrentMonth,
  isDateInCurrentWeek,
  isDateInCurrentYear,
  isOverdue,
} from './utils/dateUtils';
import {
  CustomBannerState,
  loadBannerState,
  loadUserName,
  saveBannerState,
  saveUserName,
} from './utils/bannerStorage';
import { loadInitialData, saveGoals, saveTasks, saveTheme } from './utils/storage';

type ConfirmState =
  | { type: 'delete-task'; task: Task }
  | { type: 'delete-goal'; goal: Goal }
  | { type: 'reset-week'; weekOffset: number }
  | { type: 'clear-completed' }
  | null;

export default function App() {
  const initial = useMemo(() => loadInitialData(), []);

  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [goals, setGoals] = useState<Goal[]>(initial.goals);
  const [theme, setTheme] = useState<ThemeId>(initial.theme);
  const [userName, setUserName] = useState<string>(() => loadUserName());
  const [banner, setBanner] = useState<CustomBannerState>(() => loadBannerState());

  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');

  // Week & Calendar navigation
  const [weekOffset, setWeekOffset] = useState(0);
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayISO());

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaultDate, setTaskDefaultDate] = useState<string | undefined>(undefined);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalDefaultTimeframe, setGoalDefaultTimeframe] = useState<GoalTimeframe>('Monthly');

  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [strawberryPopCount, setStrawberryPopCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Apply and persist theme
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  // Persist tasks and goals
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveUserName(userName);
  }, [userName]);

  useEffect(() => {
    saveBannerState(banner);
  }, [banner]);

  // Keyboard shortcut `/` to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const todayISO = getTodayISO();

  // Live metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const todayTasks = tasks.filter((t) => t.dueDate === todayISO);
    const todayDone = todayTasks.filter((t) => t.status === 'Completed').length;
    const todayPct =
      todayTasks.length > 0 ? Math.round((todayDone / todayTasks.length) * 100) : 0;

    return {
      total,
      completed,
      pending,
      inProgress,
      active: pending + inProgress,
      overdue,
      completionPct,
      todayDone,
      todayTotal: todayTasks.length,
      todayPct,
    };
  }, [tasks, todayISO]);

  // Reminders (overdue or due today, not completed)
  const alertTasks = useMemo(() => {
    return tasks
      .filter(
        (t) =>
          t.status !== 'Completed' &&
          (t.dueDate === todayISO || isOverdue(t.dueDate, t.status))
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, todayISO]);

  // Filtered tasks for To-Do list
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (query) {
          const matchesQuery =
            t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query);
          if (!matchesQuery) return false;
        }

        if (timeframeFilter === 'today' && t.dueDate !== todayISO) return false;
        if (timeframeFilter === 'week' && !isDateInCurrentWeek(t.dueDate)) return false;
        if (timeframeFilter === 'month' && !isDateInCurrentMonth(t.dueDate)) return false;
        if (timeframeFilter === 'year' && !isDateInCurrentYear(t.dueDate)) return false;

        if (statusFilter === 'pending' && t.status !== 'Pending') return false;
        if (statusFilter === 'in_progress' && t.status !== 'In Progress') return false;
        if (statusFilter === 'completed' && t.status !== 'Completed') return false;
        if (statusFilter === 'overdue' && !isOverdue(t.dueDate, t.status)) return false;

        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        // Put incomplete before completed, then sort by dueDate ascending
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, searchQuery, timeframeFilter, statusFilter, priorityFilter, todayISO]);

  // Completed archive tasks
  const completedTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (t.status !== 'Completed') return false;
        if (q && !t.title.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (b.completedAt || b.dueDate).localeCompare(a.completedAt || a.dueDate));
  }, [tasks, searchQuery]);

  const detailTask = useMemo(
    () => tasks.find((t) => t.id === detailTaskId) || null,
    [tasks, detailTaskId]
  );

  // CRUD Handlers for Tasks
  const handleOpenCreateTask = (presetDate?: string) => {
    setEditingTask(null);
    setTaskDefaultDate(presetDate || todayISO);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDefaultDate(undefined);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    category: string;
    status: TaskStatus;
  }) => {
    const nowISO = new Date().toISOString();
    if (editingTask) {
      if (editingTask.status !== 'Completed' && data.status === 'Completed') {
        setStrawberryPopCount((c) => c + 1);
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                ...data,
                completedAt:
                  data.status === 'Completed'
                    ? t.completedAt || nowISO
                    : undefined,
              }
            : t
        )
      );
    } else {
      if (data.status === 'Completed') {
        setStrawberryPopCount((c) => c + 1);
      }
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...data,
        createdAt: nowISO,
        completedAt: data.status === 'Completed' ? nowISO : undefined,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleComplete = (taskId: string) => {
    const nowISO = new Date().toISOString();
    const target = tasks.find((t) => t.id === taskId);
    if (target && target.status !== 'Completed') {
      setStrawberryPopCount((c) => c + 1);
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus: TaskStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'Completed' ? nowISO : undefined,
        };
      })
    );
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const nowISO = new Date().toISOString();
    const target = tasks.find((t) => t.id === taskId);
    if (target && target.status !== 'Completed' && status === 'Completed') {
      setStrawberryPopCount((c) => c + 1);
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedAt: status === 'Completed' ? t.completedAt || nowISO : undefined,
            }
          : t
      )
    );
  };

  // CRUD Handlers for Goals
  const handleOpenCreateGoal = (timeframe: GoalTimeframe = 'Monthly') => {
    setEditingGoal(null);
    setGoalDefaultTimeframe(timeframe);
    setGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  const handleSaveGoal = (data: {
    title: string;
    description: string;
    timeframe: GoalTimeframe;
    current: number;
    target: number;
    unit: string;
    category: string;
  }) => {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) => (g.id === editingGoal.id ? { ...g, ...data } : g))
      );
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...data,
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);
    }
    setGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleUpdateGoalProgress = (goalId: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const nextCurrent = Math.min(g.target, Math.max(0, g.current + delta));
        return { ...g, current: nextCurrent };
      })
    );
  };

  // Confirm Dialog Execution
  const handleConfirmAction = () => {
    if (!confirmState) return;
    if (confirmState.type === 'delete-task') {
      setTasks((prev) => prev.filter((t) => t.id !== confirmState.task.id));
      if (detailTaskId === confirmState.task.id) setDetailTaskId(null);
    } else if (confirmState.type === 'delete-goal') {
      setGoals((prev) => prev.filter((g) => g.id !== confirmState.goal.id));
    } else if (confirmState.type === 'reset-week') {
      const week = getWeekDates(confirmState.weekOffset);
      const start = week[0].iso;
      const end = week[6].iso;
      // Reset tasks in the viewed week back to Pending so users can reuse weekly routine or clear progress
      setTasks((prev) =>
        prev.map((t) =>
          t.dueDate >= start && t.dueDate <= end
            ? { ...t, status: 'Pending', completedAt: undefined }
            : t
        )
      );
    } else if (confirmState.type === 'clear-completed') {
      setTasks((prev) => prev.filter((t) => t.status !== 'Completed'));
    }
    setConfirmState(null);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setTimeframeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('All');
  };

  const renderTodoListSection = (title = 'To-Do List') => (
    <section
      aria-labelledby="todo-list-heading"
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
        <div>
          <h2
            id="todo-list-heading"
            className="text-base sm:text-lg font-semibold text-[var(--text-primary)]"
          >
            {title}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenCreateTask()}
          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)] whitespace-nowrap"
          style={{
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-primary)',
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1 rounded-xl p-1"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
          role="tablist"
          aria-label="Filter tasks by status"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'overdue', label: `Overdue (${stats.overdue})` },
            ] as { id: StatusFilter; label: string }[]
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.id)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by timeframe"
            value={timeframeFilter}
            onChange={(e) => setTimeframeFilter(e.target.value as TimeframeFilter)}
            className="rounded-xl border px-3 py-1.5 text-xs font-medium outline-none focus:border-[var(--accent-primary)]"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')}
            className="rounded-xl border px-3 py-1.5 text-xs font-medium outline-none focus:border-[var(--accent-primary)]"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Celebration Banner when all tasks or all daily tasks are completed */}
      {tasks.length > 0 && stats.completed === stats.total && (
        <div
          className="mt-4 flex items-center gap-3.5 rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: 'var(--sage-soft)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <StrawberryMascot size={32} celebrating popTrigger={strawberryPopCount} />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              You did it! Time to relax.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Every task on your list is completed.
            </p>
          </div>
        </div>
      )}

      {tasks.length > 0 &&
        stats.completed < stats.total &&
        stats.todayTotal > 0 &&
        stats.todayDone === stats.todayTotal && (
          <div
            className="mt-4 flex items-center gap-3.5 rounded-2xl border px-4 py-3"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            <StrawberryMascot size={30} celebrating popTrigger={strawberryPopCount} />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Yay! You're all caught up!
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                All {stats.todayTotal} of today's tasks are finished.
              </p>
            </div>
          </div>
        )}

      {/* Task cards */}
      <div className="mt-4 space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-10 text-center">
            {statusFilter === 'pending' && !searchQuery && timeframeFilter === 'all' && priorityFilter === 'All' ? (
              <>
                <div className="flex justify-center mb-2">
                  {tasks.length > 0 && stats.completed === stats.total ? (
                    <StrawberryMascot size={42} celebrating popTrigger={strawberryPopCount} />
                  ) : (
                    <CatMascot size={42} />
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {tasks.length > 0 && stats.completed === stats.total
                    ? 'You did it! Time to relax.'
                    : "Yay! You're all caught up!"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  There are no pending tasks right now.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <CatMascot size={40} />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {tasks.length === 0
                    ? "Yay! You're all caught up!"
                    : 'No matching tasks found'}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {searchQuery || timeframeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'All'
                    ? 'Try clearing your active search or filters.'
                    : 'Create a task whenever something new comes to mind.'}
                </p>
              </>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              {(searchQuery ||
                timeframeFilter !== 'all' ||
                statusFilter !== 'all' ||
                priorityFilter !== 'All') && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="rounded-xl border px-3.5 py-2 text-xs font-medium hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenCreateTask()}
                className="rounded-xl px-4 py-2 text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Add Task
              </button>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onSelect={(t) => setDetailTaskId(t.id)}
              onEdit={handleOpenEditTask}
              onDelete={(t) => setConfirmState({ type: 'delete-task', task: t })}
            />
          ))
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        todayCompletionPct={stats.todayPct}
        todayDone={stats.todayDone}
        todayTotal={stats.todayTotal}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={userName}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onThemeChange={setTheme}
          onOpenNewTask={() => handleOpenCreateTask()}
          alertTasks={alertTasks}
          onSelectTask={(t) => setDetailTaskId(t.id)}
          searchInputRef={searchInputRef}
        />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Top Dashboard Strip: Positive Note First + Cute Theme Image Area (Dashboard only) */}
          {activeView === 'dashboard' && (
            <section
              aria-label="Daily positive note and theme cover"
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center"
            >
              <div className="lg:col-span-8 h-full">
                <DailyQuoteNote />
              </div>
              <div className="lg:col-span-4">
                <ThemeBannerCard theme={theme} banner={banner} />
              </div>
            </section>
          )}

          {/* Overview Stats Strip */}
          {activeView !== 'calendar' && activeView !== 'settings' && (
          <section aria-label="Task progress overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <p className="text-xs font-medium text-[var(--text-secondary)]">Total Tasks</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {stats.total}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums">
                {stats.todayTotal} scheduled today
              </p>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <p className="text-xs font-medium text-[var(--text-secondary)]">Pending & Active</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {stats.active}
              </p>
              <p className="mt-1 text-xs tabular-nums" style={{ color: stats.overdue > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                {stats.overdue > 0 ? `${stats.overdue} overdue` : `${stats.inProgress} in progress`}
              </p>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <p className="text-xs font-medium text-[var(--text-secondary)]">Completed</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {stats.completed}
              </p>
              <p className="mt-1 text-xs tabular-nums" style={{ color: 'var(--sage)' }}>
                {stats.todayDone} finished today
              </p>
            </div>

            <div
              className="rounded-2xl border p-4 flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--text-secondary)]">Completion Rate</p>
                  <span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">
                    {stats.completionPct}%
                  </span>
                </div>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.completionPct}%`,
                      backgroundColor: 'var(--sage)',
                    }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-[var(--text-muted)] tabular-nums truncate">
                  {stats.todayTotal > 0 && stats.todayDone === stats.todayTotal
                    ? 'All daily tasks done!'
                    : `${stats.completed} of ${stats.total} overall`}
                </p>
              </div>
              <StrawberryMascot
                size={30}
                celebrating={
                  (stats.todayTotal > 0 && stats.todayDone === stats.todayTotal) ||
                  (stats.total > 0 && stats.completed === stats.total)
                }
                popTrigger={strawberryPopCount}
                className="shrink-0"
              />
            </div>
          </section>
          )}

          {/* Active View Content */}
          {activeView === 'dashboard' && (
            <>
              <WeeklyPlanner
                tasks={tasks}
                weekOffset={weekOffset}
                onChangeWeekOffset={setWeekOffset}
                onToggleComplete={handleToggleComplete}
                onSelectTask={(t) => setDetailTaskId(t.id)}
                onAddTaskForDate={(iso) => handleOpenCreateTask(iso)}
                onRequestResetWeek={() => setConfirmState({ type: 'reset-week', weekOffset })}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">{renderTodoListSection('To-Do List')}</div>
                <div className="lg:col-span-5 space-y-6">
                  <CalendarWidget
                    tasks={tasks}
                    viewYear={calendarYear}
                    viewMonth={calendarMonth}
                    selectedDate={selectedDate}
                    onChangeMonth={(y, m) => {
                      setCalendarYear(y);
                      setCalendarMonth(m);
                    }}
                    onSelectDate={setSelectedDate}
                    onToggleComplete={handleToggleComplete}
                    onSelectTask={(t) => setDetailTaskId(t.id)}
                    onAddTaskForDate={(iso) => handleOpenCreateTask(iso)}
                  />
                  <GoalsSection
                    goals={goals}
                    onUpdateProgress={handleUpdateGoalProgress}
                    onAddGoal={handleOpenCreateGoal}
                    onEditGoal={handleOpenEditGoal}
                    onDeleteGoal={(g) => setConfirmState({ type: 'delete-goal', goal: g })}
                  />
                </div>
              </div>
            </>
          )}

          {activeView === 'weekly' && (
            <div className="space-y-6">
              <WeeklyPlanner
                tasks={tasks}
                weekOffset={weekOffset}
                onChangeWeekOffset={setWeekOffset}
                onToggleComplete={handleToggleComplete}
                onSelectTask={(t) => setDetailTaskId(t.id)}
                onAddTaskForDate={(iso) => handleOpenCreateTask(iso)}
                onRequestResetWeek={() => setConfirmState({ type: 'reset-week', weekOffset })}
                expanded
              />
              {renderTodoListSection('All Scheduled Tasks')}
            </div>
          )}

          {activeView === 'monthly' && (
            <div className="space-y-6">
              <CalendarWidget
                tasks={tasks}
                viewYear={calendarYear}
                viewMonth={calendarMonth}
                selectedDate={selectedDate}
                onChangeMonth={(y, m) => {
                  setCalendarYear(y);
                  setCalendarMonth(m);
                }}
                onSelectDate={setSelectedDate}
                onToggleComplete={handleToggleComplete}
                onSelectTask={(t) => setDetailTaskId(t.id)}
                onAddTaskForDate={(iso) => handleOpenCreateTask(iso)}
                layout="wide"
              />
            </div>
          )}

          {activeView === 'calendar' && (
            <FullCalendarPage
              tasks={tasks}
              viewYear={calendarYear}
              viewMonth={calendarMonth}
              selectedDate={selectedDate}
              searchQuery={searchQuery}
              onChangeMonth={(y, m) => {
                setCalendarYear(y);
                setCalendarMonth(m);
              }}
              onSelectDate={setSelectedDate}
              onToggleComplete={handleToggleComplete}
              onSelectTask={(t) => setDetailTaskId(t.id)}
              onEditTask={handleOpenEditTask}
              onDeleteTask={(t) => setConfirmState({ type: 'delete-task', task: t })}
              onAddTaskForDate={(iso) => handleOpenCreateTask(iso)}
            />
          )}

          {activeView === 'goals' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Yearly Goals
                </h2>
                <GoalsSection
                  goals={goals}
                  filterTimeframe="Yearly"
                  onUpdateProgress={handleUpdateGoalProgress}
                  onAddGoal={() => handleOpenCreateGoal('Yearly')}
                  onEditGoal={handleOpenEditGoal}
                  onDeleteGoal={(g) => setConfirmState({ type: 'delete-goal', goal: g })}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Monthly Goals
                </h2>
                <GoalsSection
                  goals={goals}
                  filterTimeframe="Monthly"
                  onUpdateProgress={handleUpdateGoalProgress}
                  onAddGoal={() => handleOpenCreateGoal('Monthly')}
                  onEditGoal={handleOpenEditGoal}
                  onDeleteGoal={(g) => setConfirmState({ type: 'delete-goal', goal: g })}
                />
              </div>
            </div>
          )}

          {activeView === 'completed' && (
            <section
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                    Completed Tasks
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                    {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>

                {completedTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmState({ type: 'clear-completed' })}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors hover:bg-[var(--rose-soft)]"
                    style={{
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--rose)',
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Completed
                  </button>
                )}
              </div>

              {completedTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-[var(--sage)] opacity-70" />
                  <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                    No completed tasks yet
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Check off tasks on your dashboard or weekly planner to archive them here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <TaskCard
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onSelect={(t) => setDetailTaskId(t.id)}
                          onEdit={handleOpenEditTask}
                          onDelete={(t) => setConfirmState({ type: 'delete-task', task: t })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(task.id, 'Pending')}
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)] shrink-0"
                        style={{
                          borderColor: 'var(--border-hairline)',
                          color: 'var(--text-secondary)',
                        }}
                        title="Restore to Pending"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeView === 'settings' && (
            <SettingsPage
              userName={userName}
              onChangeUserName={setUserName}
              theme={theme}
              onChangeTheme={setTheme}
              banner={banner}
              onChangeBanner={setBanner}
            />
          )}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskModal
        open={taskModalOpen}
        initialTask={editingTask}
        defaultDate={taskDefaultDate}
        onSave={handleSaveTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTaskId(null)}
        onEdit={handleOpenEditTask}
        onDelete={(t) => setConfirmState({ type: 'delete-task', task: t })}
        onStatusChange={handleStatusChange}
      />

      {/* Create / Edit Goal Modal */}
      <GoalModal
        open={goalModalOpen}
        initialGoal={editingGoal}
        defaultTimeframe={goalDefaultTimeframe}
        onSave={handleSaveGoal}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmState !== null}
        title={
          confirmState?.type === 'delete-task'
            ? 'Delete Task'
            : confirmState?.type === 'delete-goal'
              ? 'Delete Goal'
              : confirmState?.type === 'reset-week'
                ? 'Reset Weekly Tasks'
                : 'Clear Completed Tasks'
        }
        message={
          confirmState?.type === 'delete-task'
            ? `Are you sure you want to delete "${confirmState.task.title}"? This action cannot be undone.`
            : confirmState?.type === 'delete-goal'
              ? `Are you sure you want to remove the goal "${confirmState.goal.title}"?`
              : confirmState?.type === 'reset-week'
                ? 'Reset all tasks scheduled in this week back to Pending so you can start the week fresh?'
                : 'Permanently remove all completed tasks from your archive? This action cannot be undone.'
        }
        confirmLabel={
          confirmState?.type === 'reset-week'
            ? 'Reset Week'
            : confirmState?.type === 'clear-completed'
              ? 'Clear All'
              : 'Delete'
        }
        tone={confirmState?.type === 'reset-week' ? 'neutral' : 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
