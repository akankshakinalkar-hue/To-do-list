import React from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react';
import { Priority, Task } from '../types';
import { getWeekDates, getWeekRangeLabel } from '../utils/dateUtils';
import { CatMascot } from './Mascots';

interface WeeklyPlannerProps {
  tasks: Task[];
  weekOffset: number;
  onChangeWeekOffset: (offset: number) => void;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onAddTaskForDate: (dateISO: string) => void;
  onRequestResetWeek: () => void;
  expanded?: boolean;
}

const PRIORITY_DOT: Record<Priority, string> = {
  High: 'var(--rose)',
  Medium: 'var(--peach)',
  Low: 'var(--sage)',
};

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  tasks,
  weekOffset,
  onChangeWeekOffset,
  onToggleComplete,
  onSelectTask,
  onAddTaskForDate,
  onRequestResetWeek,
  expanded = false,
}) => {
  const days = getWeekDates(weekOffset);
  const rangeLabel = getWeekRangeLabel(weekOffset);

  const weekTasks = tasks.filter(
    (t) => t.dueDate >= days[0].iso && t.dueDate <= days[6].iso
  );
  const weekCompleted = weekTasks.filter((t) => t.status === 'Completed').length;
  const weekPct =
    weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  return (
    <section aria-labelledby="weekly-planner-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2
              id="weekly-planner-heading"
              className="text-base sm:text-lg font-semibold text-[var(--text-primary)]"
            >
              Weekly Planner
            </h2>
            <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums">
              {weekCompleted}/{weekTasks.length} completed ({weekPct}%)
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">{rangeLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center rounded-xl border p-0.5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            <button
              type="button"
              onClick={() => onChangeWeekOffset(weekOffset - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>
            <button
              type="button"
              onClick={() => onChangeWeekOffset(0)}
              className="px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors whitespace-nowrap"
            >
              {weekOffset === 0 ? 'This Week' : 'Current'}
            </button>
            <button
              type="button"
              onClick={() => onChangeWeekOffset(weekOffset + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRequestResetWeek}
            disabled={weekTasks.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-secondary)',
            }}
            title="Reset tasks in this week"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Week</span>
          </button>

          {!expanded && (
            <div className="hidden sm:flex items-center pl-1" title="Weekly companion">
              <CatMascot size={32} />
            </div>
          )}
        </div>
      </div>

      {/* 7-day organized cards grid */}
      <div
        className={`grid gap-3 ${
          expanded
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7'
        }`}
      >
        {days.map((day) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.iso);
          const doneCount = dayTasks.filter((t) => t.status === 'Completed').length;
          const pendingCount = dayTasks.length - doneCount;
          const pct = dayTasks.length > 0 ? Math.round((doneCount / dayTasks.length) * 100) : 0;

          return (
            <div
              key={day.iso}
              className="flex flex-col rounded-2xl border p-3.5 transition-colors"
              style={{
                backgroundColor: day.isToday ? 'var(--bg-surface)' : 'var(--bg-surface)',
                borderColor: day.isToday ? 'var(--accent-primary)' : 'var(--border-hairline)',
                boxShadow: day.isToday
                  ? '0 2px 10px -2px color-mix(in srgb, var(--accent-primary) 16%, transparent)'
                  : 'none',
              }}
            >
              {/* Day header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[var(--border-hairline)]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {expanded ? day.dayName : day.shortDay}
                    </span>
                    {day.isToday && (
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] tabular-nums">
                    {day.monthShort} {day.dayNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onAddTaskForDate(day.iso)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                  aria-label={`Add task for ${day.dayName}`}
                  title={`Add task for ${day.monthShort} ${day.dayNumber}`}
                >
                  <Plus className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Counts & Progress Bar */}
              <div className="mt-2.5 mb-3">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] tabular-nums">
                  <span>{doneCount} done</span>
                  <span>{pendingCount} left</span>
                </div>
                <div
                  className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct === 100 && dayTasks.length > 0 ? 'var(--sage)' : 'var(--accent-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Tasks list for this day */}
              <div className="flex-1 space-y-1.5">
                {dayTasks.length === 0 ? (
                  <p className="py-3 text-center text-xs text-[var(--text-muted)]">
                    No tasks scheduled
                  </p>
                ) : (
                  dayTasks.map((task) => {
                    const done = task.status === 'Completed';
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--bg-canvas)]"
                      >
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task.id)}
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                          style={{
                            backgroundColor: done ? 'var(--sage)' : 'transparent',
                            borderColor: done ? 'var(--sage)' : 'var(--border-strong)',
                          }}
                          aria-label={
                            done
                              ? `Mark "${task.title}" pending`
                              : `Mark "${task.title}" completed`
                          }
                        >
                          {done && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p
                            className={`text-xs leading-snug line-clamp-2 ${
                              done
                                ? 'line-through text-[var(--text-muted)]'
                                : 'text-[var(--text-primary)] font-medium'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{task.category}</span>
                          </div>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {expanded && (
          <div
            className="hidden xl:flex flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-center"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            <CatMascot size={44} />
            <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
              Quiet week companion
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              {weekCompleted} of {weekTasks.length} tasks wrapped up
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
