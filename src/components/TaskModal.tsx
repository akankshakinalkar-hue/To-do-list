import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Priority, Task, TaskStatus } from '../types';
import { getTodayISO } from '../utils/dateUtils';
import { DEFAULT_CATEGORIES } from '../utils/storage';

interface TaskModalProps {
  open: boolean;
  initialTask?: Task | null;
  defaultDate?: string;
  onSave: (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    category: string;
    status: TaskStatus;
  }) => void;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; dotColor: string; softBg: string }[] = [
  { value: 'High', dotColor: 'var(--rose)', softBg: 'var(--rose-soft)' },
  { value: 'Medium', dotColor: 'var(--peach)', softBg: 'var(--peach-soft)' },
  { value: 'Low', dotColor: 'var(--sage)', softBg: 'var(--sage-soft)' },
];

const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  initialTask,
  defaultDate,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setDueDate(initialTask.dueDate);
      setPriority(initialTask.priority);
      const isDefault = DEFAULT_CATEGORIES.includes(initialTask.category);
      setCategory(isDefault ? initialTask.category : 'Custom');
      setCustomCategory(isDefault ? '' : initialTask.category);
      setStatus(initialTask.status);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || getTodayISO());
      setPriority('Medium');
      setCategory('Work');
      setCustomCategory('');
      setStatus('Pending');
    }
    setErrors({});
  }, [open, initialTask, defaultDate]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) {
      nextErrors.title = 'Please enter a task title.';
    }
    if (!dueDate) {
      nextErrors.dueDate = 'Please select a due date.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const resolvedCategory =
      category === 'Custom' ? customCategory.trim() || 'General' : category;

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      category: resolvedCategory,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-heading"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-xl max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h2 id="task-modal-heading" className="text-lg font-semibold">
              {initialTask ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {initialTask
                ? 'Update task details, schedule, or progress status.'
                : 'Add a task to your planner and daily schedule.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Task Title <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Draft monthly studio newsletter"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: errors.title ? 'var(--rose)' : 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
            {errors.title && (
              <p className="mt-1 text-xs" style={{ color: 'var(--rose)' }}>
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-desc"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Description
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes, links, or sub-steps..."
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)] resize-none"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-date"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Due Date <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm tabular-nums outline-none transition-colors focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: errors.dueDate ? 'var(--rose)' : 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs" style={{ color: 'var(--rose)' }}>
                  {errors.dueDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="task-category"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">Custom category...</option>
              </select>
            </div>
          </div>

          {category === 'Custom' && (
            <div>
              <label
                htmlFor="custom-category"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Custom Category Name
              </label>
              <input
                id="custom-category"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g., Creative, Finance, Travel"
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          <div>
            <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Priority
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((item) => {
                const active = priority === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPriority(item.value)}
                    className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor: active ? item.softBg : 'var(--bg-canvas)',
                      borderColor: active ? item.dotColor : 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.dotColor }}
                      aria-hidden="true"
                    />
                    <span>{item.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Status
            </span>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((st) => {
                const active = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className="rounded-xl border px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
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

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-subtle)] whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
