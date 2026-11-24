import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-lg transition-transform duration-150"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: tone === 'danger' ? 'var(--rose-soft)' : 'var(--bg-subtle)',
                color: tone === 'danger' ? 'var(--rose)' : 'var(--accent-primary)',
              }}
            >
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 id="confirm-dialog-title" className="text-base font-semibold">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
            aria-label="Close confirmation dialog"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] whitespace-nowrap shrink-0"
            style={{
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] whitespace-nowrap shrink-0"
            style={{
              backgroundColor: tone === 'danger' ? 'var(--rose)' : 'var(--accent-primary)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
