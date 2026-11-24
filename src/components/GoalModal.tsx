import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Goal, GoalTimeframe } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/storage';

interface GoalModalProps {
  open: boolean;
  initialGoal?: Goal | null;
  defaultTimeframe?: GoalTimeframe;
  onSave: (data: {
    title: string;
    description: string;
    timeframe: GoalTimeframe;
    current: number;
    target: number;
    unit: string;
    category: string;
  }) => void;
  onClose: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  open,
  initialGoal,
  defaultTimeframe = 'Monthly',
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState<GoalTimeframe>(defaultTimeframe);
  const [current, setCurrent] = useState('0');
  const [target, setTarget] = useState('10');
  const [unit, setUnit] = useState('milestones');
  const [category, setCategory] = useState('Personal');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description);
      setTimeframe(initialGoal.timeframe);
      setCurrent(String(initialGoal.current));
      setTarget(String(initialGoal.target));
      setUnit(initialGoal.unit);
      setCategory(initialGoal.category);
    } else {
      setTitle('');
      setDescription('');
      setTimeframe(defaultTimeframe);
      setCurrent('0');
      setTarget('10');
      setUnit('sessions');
      setCategory('Personal');
    }
    setError('');
  }, [open, initialGoal, defaultTimeframe]);

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
    if (!title.trim()) {
      setError('Please enter a goal title.');
      return;
    }
    const targetNum = Math.max(1, Number(target) || 1);
    const currentNum = Math.min(targetNum, Math.max(0, Number(current) || 0));

    onSave({
      title: title.trim(),
      description: description.trim(),
      timeframe,
      current: currentNum,
      target: targetNum,
      unit: unit.trim() || 'steps',
      category,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-heading"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
          <h2 id="goal-modal-heading" className="text-lg font-semibold">
            {initialGoal ? 'Edit Goal' : 'New Goal'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--bg-subtle)]"
            aria-label="Close goal modal"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="goal-title" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Goal Title <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Complete 12 studio paintings"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent-primary)]"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: error ? 'var(--rose)' : 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
            {error && (
              <p className="mt-1 text-xs" style={{ color: 'var(--rose)' }}>
                {error}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="goal-desc" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Notes
            </label>
            <textarea
              id="goal-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional motivation or milestone breakdown..."
              className="w-full rounded-xl border px-3.5 py-2 text-sm outline-none focus:border-[var(--accent-primary)] resize-none"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Timeframe
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Monthly', 'Yearly'] as GoalTimeframe[]).map((tf) => {
                  const active = timeframe === tf;
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className="rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-hairline)',
                      }}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="goal-cat" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Category
              </label>
              <select
                id="goal-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="goal-current" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Current
              </label>
              <input
                id="goal-current"
                type="number"
                min={0}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm tabular-nums outline-none focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                }}
              />
            </div>
            <div>
              <label htmlFor="goal-target" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Target
              </label>
              <input
                id="goal-target"
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm tabular-nums outline-none focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                }}
              />
            </div>
            <div>
              <label htmlFor="goal-unit" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Unit
              </label>
              <input
                id="goal-unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="books"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {initialGoal ? 'Save Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
