import React from 'react';
import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Priority, Task } from '../types';
import { buildMonthGrid, formatFullDate, getTodayISO } from '../utils/dateUtils';

interface CalendarWidgetProps {
  tasks: Task[];
  viewYear: number;
  viewMonth: number; // 0-11
  selectedDate: string;
  onChangeMonth: (year: number, month: number) => void;
  onSelectDate: (iso: string) => void;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onAddTaskForDate: (dateISO: string) => void;
  layout?: 'compact' | 'wide';
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRIORITY_DOT: Record<Priority, string> = {
  High: 'var(--rose)',
  Medium: 'var(--peach)',
  Low: 'var(--sage)',
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  tasks,
  viewYear,
  viewMonth,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  onToggleComplete,
  onSelectTask,
  onAddTaskForDate,
  layout = 'compact',
}) => {
  const cells = buildMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (viewMonth === 0) onChangeMonth(viewYear - 1, 11);
    else onChangeMonth(viewYear, viewMonth - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) onChangeMonth(viewYear + 1, 0);
    else onChangeMonth(viewYear, viewMonth + 1);
  };

  const handleJumpToday = () => {
    const now = new Date();
    onChangeMonth(now.getFullYear(), now.getMonth());
    onSelectDate(getTodayISO());
  };

  // Map tasks by dueDate
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      const list = map.get(t.dueDate) || [];
      list.push(t);
      map.set(t.dueDate, list);
    });
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDate.get(selectedDate) || [];

  const calendarGrid = (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex items-center justify-between gap-2 pb-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleJumpToday}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[var(--text-muted)] pb-2">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const dayTasks = tasksByDate.get(cell.iso) || [];
          const isSelected = cell.iso === selectedDate;
          const hasIncomplete = dayTasks.some((t) => t.status !== 'Completed');
          const hasHigh = dayTasks.some(
            (t) => t.priority === 'High' && t.status !== 'Completed'
          );

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDate(cell.iso)}
              className="relative flex flex-col items-center justify-center rounded-xl py-2 text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
              style={{
                backgroundColor: isSelected
                  ? 'var(--accent-primary)'
                  : cell.isToday
                    ? 'var(--bg-subtle)'
                    : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : cell.inCurrentMonth
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                fontWeight: isSelected || cell.isToday ? 600 : 400,
              }}
              aria-label={`${cell.iso}, ${dayTasks.length} tasks`}
              aria-pressed={isSelected}
            >
              <span>{cell.dayNumber}</span>
              <span className="mt-1 flex h-1.5 items-center gap-0.5">
                {dayTasks.length > 0 && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? '#ffffff'
                        : hasHigh
                          ? 'var(--rose)'
                          : hasIncomplete
                            ? 'var(--accent-primary)'
                            : 'var(--sage)',
                    }}
                  />
                )}
                {dayTasks.length > 1 && (
                  <span
                    className="h-1.5 w-1.5 rounded-full opacity-60"
                    style={{
                      backgroundColor: isSelected ? '#ffffff' : 'var(--peach)',
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {layout === 'compact' && (
        <div className="mt-4 pt-4 border-t border-[var(--border-hairline)]">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">
              {formatFullDate(selectedDate)}
            </h3>
            <button
              type="button"
              onClick={() => onAddTaskForDate(selectedDate)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {selectedTasks.length === 0 ? (
            <p className="py-3 text-xs text-[var(--text-muted)]">
              No tasks scheduled for this date.
            </p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {selectedTasks.map((task) => {
                const done = task.status === 'Completed';
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-[var(--bg-canvas)] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleComplete(task.id)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                      style={{
                        backgroundColor: done ? 'var(--sage)' : 'transparent',
                        borderColor: done ? 'var(--sage)' : 'var(--border-strong)',
                      }}
                      aria-label={`Toggle "${task.title}"`}
                    >
                      {done && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className={`min-w-0 flex-1 text-left text-xs truncate ${
                        done
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)] font-medium'
                      }`}
                    >
                      {task.title}
                    </button>
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                      title={`${task.priority} priority`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  if (layout === 'compact') {
    return calendarGrid;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5">{calendarGrid}</div>
      <div
        className="lg:col-span-7 rounded-2xl border p-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Tasks for {formatFullDate(selectedDate)}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
              {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} scheduled
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAddTaskForDate(selectedDate)}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-white whitespace-nowrap"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Nothing scheduled on {formatFullDate(selectedDate)}.
            </p>
            <button
              type="button"
              onClick={() => onAddTaskForDate(selectedDate)}
              className="mt-3 text-xs font-medium text-[var(--accent-primary)] hover:underline"
            >
              Schedule a task for this day
            </button>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-hairline)]">
            {selectedTasks.map((task) => {
              const done = task.status === 'Completed';
              return (
                <li key={task.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                    style={{
                      backgroundColor: done ? 'var(--sage)' : 'var(--bg-surface)',
                      borderColor: done ? 'var(--sage)' : 'var(--border-strong)',
                    }}
                    aria-label={`Toggle "${task.title}"`}
                  >
                    {done && <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      className={`text-sm font-medium ${
                        done
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {task.category} · {task.priority} · {task.status}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
