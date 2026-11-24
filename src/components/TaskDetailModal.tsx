import React, { useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Edit3, Folder, Trash2, X } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { formatFullDate, isOverdue } from '../utils/dateUtils';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const PRIORITY_COLORS = {
  High: { dot: 'var(--rose)', label: 'High Priority' },
  Medium: { dot: 'var(--peach)', label: 'Medium Priority' },
  Low: { dot: 'var(--sage)', label: 'Low Priority' },
};

const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  useEffect(() => {
    if (!task) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [task, onClose]);

  if (!task) return null;

  const pMeta = PRIORITY_COLORS[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: pMeta.dot }}
                  aria-hidden="true"
                />
                {pMeta.label}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Folder className="h-3.5 w-3.5" />
                {task.category}
              </span>
              {overdue && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium" style={{ color: 'var(--rose)' }}>
                    Overdue
                  </span>
                </>
              )}
            </div>
            <h2
              id="task-detail-title"
              className={`text-xl font-semibold leading-snug ${
                task.status === 'Completed' ? 'line-through text-[var(--text-muted)]' : ''
              }`}
            >
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-[var(--bg-subtle)]"
            aria-label="Close details"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pb-4 border-b border-[var(--border-hairline)]">
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Calendar className="h-3.5 w-3.5" />
            Due {formatFullDate(task.dueDate)}
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Clock className="h-3.5 w-3.5" />
            Added {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {task.completedAt && (
            <span className="inline-flex items-center gap-1.5 tabular-nums" style={{ color: 'var(--sage)' }}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-1.5">Notes</h3>
          <p className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
            {task.description || 'No additional notes added for this task.'}
          </p>
        </div>

        <div className="mt-5">
          <span className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
            Update Status
          </span>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((st) => {
              const active = task.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange(task.id, st)}
                  className="rounded-xl border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                    borderColor: active ? 'var(--accent-primary)' : 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors hover:bg-[var(--rose-soft)] whitespace-nowrap"
            style={{
              borderColor: 'var(--border-hairline)',
              color: 'var(--rose)',
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Task
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(task);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};
