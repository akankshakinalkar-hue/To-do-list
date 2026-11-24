import React from 'react';
import { Check, Edit3, Trash2 } from 'lucide-react';
import { Priority, Task } from '../types';
import { formatShortDate, isOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_META: Record<Priority, { dot: string; label: string }> = {
  High: { dot: 'var(--rose)', label: 'High' },
  Medium: { dot: 'var(--peach)', label: 'Medium' },
  Low: { dot: 'var(--sage)', label: 'Low' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'Completed';
  const overdue = isOverdue(task.dueDate, task.status);
  const pMeta = PRIORITY_META[task.priority];

  return (
    <div
      className="group flex items-start gap-3.5 rounded-2xl border p-4 transition-colors duration-150 hover:border-[var(--border-strong)]"
      style={{
        backgroundColor: isCompleted ? 'var(--bg-canvas)' : 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <button
        type="button"
        onClick={() => onToggleComplete(task.id)}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
        style={{
          backgroundColor: isCompleted ? 'var(--sage)' : 'var(--bg-surface)',
          borderColor: isCompleted ? 'var(--sage)' : 'var(--border-strong)',
        }}
        aria-label={isCompleted ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
        aria-pressed={isCompleted}
      >
        {isCompleted && <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />}
      </button>

      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={() => onSelect(task)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(task);
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium leading-snug ${
              isCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
            }`}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-1">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--text-secondary)]">
          <span
            className="tabular-nums font-medium"
            style={{ color: overdue ? 'var(--rose)' : 'var(--text-secondary)' }}
          >
            {overdue ? `Overdue · ${formatShortDate(task.dueDate)}` : formatShortDate(task.dueDate)}
          </span>
          <span aria-hidden="true" className="text-[var(--text-muted)]">
            ·
          </span>
          <span>{task.category}</span>
          <span aria-hidden="true" className="text-[var(--text-muted)]">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: pMeta.dot }}
              aria-hidden="true"
            />
            <span>{pMeta.label}</span>
          </span>
          <span aria-hidden="true" className="text-[var(--text-muted)]">
            ·
          </span>
          <span
            style={{
              color:
                task.status === 'Completed'
                  ? 'var(--sage)'
                  : task.status === 'In Progress'
                    ? 'var(--peach)'
                    : 'var(--text-secondary)',
            }}
          >
            {task.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          aria-label={`Edit "${task.title}"`}
          title="Edit task"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--rose-soft)] hover:text-[var(--rose)]"
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
