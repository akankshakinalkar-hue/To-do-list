import React from 'react';
import { Edit3, Minus, Plus, Trash2 } from 'lucide-react';
import { Goal, GoalTimeframe } from '../types';

interface GoalsSectionProps {
  goals: Goal[];
  onUpdateProgress: (goalId: string, delta: number) => void;
  onAddGoal: (timeframe?: GoalTimeframe) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  filterTimeframe?: GoalTimeframe | 'All';
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onUpdateProgress,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  filterTimeframe = 'All',
}) => {
  const visibleGoals =
    filterTimeframe === 'All'
      ? goals
      : goals.filter((g) => g.timeframe === filterTimeframe);

  return (
    <section
      aria-labelledby="goals-section-heading"
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
        <div>
          <h2
            id="goals-section-heading"
            className="text-base font-semibold text-[var(--text-primary)]"
          >
            Goals & Progress
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Monthly intentions and yearly milestones
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddGoal(filterTimeframe === 'Yearly' ? 'Yearly' : 'Monthly')}
          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)] whitespace-nowrap"
          style={{
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-primary)',
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Goal</span>
        </button>
      </div>

      {visibleGoals.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No goals added yet.</p>
          <button
            type="button"
            onClick={() => onAddGoal('Monthly')}
            className="mt-2 text-xs font-medium text-[var(--accent-primary)] hover:underline"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[var(--border-hairline)]">
          {visibleGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / Math.max(1, goal.target)) * 100));
            const isYearly = goal.timeframe === 'Yearly';

            return (
              <div key={goal.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                      <span
                        className="font-medium"
                        style={{ color: isYearly ? 'var(--peach)' : 'var(--sage)' }}
                      >
                        {goal.timeframe}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{goal.category}</span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditGoal(goal)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
                      aria-label={`Edit goal "${goal.title}"`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--rose-soft)] hover:text-[var(--rose)] transition-colors"
                      aria-label={`Delete goal "${goal.title}"`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-1">
                    {goal.description}
                  </p>
                )}

                <div className="mt-2.5 flex items-center gap-3">
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct >= 100
                            ? 'var(--sage)'
                            : isYearly
                              ? 'var(--peach)'
                              : 'var(--accent-primary)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-primary)] tabular-nums shrink-0 w-10 text-right">
                    {pct}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdateProgress(goal.id, -1)}
                      disabled={goal.current <= 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 transition-colors"
                      style={{ borderColor: 'var(--border-hairline)' }}
                      aria-label={`Decrease progress for ${goal.title}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateProgress(goal.id, 1)}
                      disabled={goal.current >= goal.target}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 transition-colors"
                      style={{ borderColor: 'var(--border-hairline)' }}
                      aria-label={`Increase progress for ${goal.title}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
