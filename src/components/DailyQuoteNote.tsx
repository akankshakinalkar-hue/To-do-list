import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, StickyNote, Trash2 } from 'lucide-react';
import { getTodayISO } from '../utils/dateUtils';

interface QuoteItem {
  text: string;
  author: string;
}

interface DailyNoteItem {
  id: string;
  text: string;
  date: string;
}

const POSITIVE_QUOTES: QuoteItem[] = [
  {
    text: 'Small steps taken gently each day quietly build the life you are proud of.',
    author: 'Daily Reminder',
  },
  {
    text: 'You do not have to finish everything at once—just begin with one calm step.',
    author: 'Mindful Planning',
  },
  {
    text: 'Progress feels lighter when you celebrate the quiet wins along the way.',
    author: 'Gentle Reminder',
  },
  {
    text: 'Make room for focus, and leave just as much room to breathe and rest.',
    author: 'Slow Productivity',
  },
  {
    text: 'Every checkmark is a promise you kept to yourself today.',
    author: 'Daily Intention',
  },
  {
    text: 'Clarity comes from doing one thoughtful thing at a time.',
    author: 'Quiet Focus',
  },
  {
    text: 'Be proud of how steadily you are showing up, even on ordinary days.',
    author: 'Kindness Note',
  },
  {
    text: 'Your pace is enough. Tend to what matters most today and let the rest wait.',
    author: 'Calm Routine',
  },
  {
    text: 'A warm cup, a clear list, and a kind mind can turn any day around.',
    author: 'Morning Ritual',
  },
  {
    text: 'Rest is not a reward you earn after exhaustion—it is part of doing good work.',
    author: 'Balanced Days',
  },
  {
    text: 'Consistency is simply returning to your intentions with patience.',
    author: 'Steady Rhythm',
  },
  {
    text: 'Do what you can with the energy you have today, and trust that it is enough.',
    author: 'Daily Affirmation',
  },
];

const QUOTE_STORAGE_KEY = 'my_tasks_daily_quote_v1';
const NOTE_DRAFT_STORAGE_KEY = 'my_tasks_daily_note_v1';
const NOTES_LIST_STORAGE_KEY = 'my_tasks_daily_notes_list_v1';

function getDayOfYearIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) % POSITIVE_QUOTES.length;
}

function loadInitialNotes(todayISO: string): DailyNoteItem[] {
  try {
    const rawList = localStorage.getItem(NOTES_LIST_STORAGE_KEY);
    if (rawList) {
      const parsed = JSON.parse(rawList) as DailyNoteItem[];
      if (Array.isArray(parsed)) return parsed;
    }
    // Migrate legacy single-note value if present
    const legacy = localStorage.getItem(NOTE_DRAFT_STORAGE_KEY);
    if (legacy && legacy.trim()) {
      return [
        {
          id: `note-${Date.now()}`,
          text: legacy.trim(),
          date: todayISO,
        },
      ];
    }
  } catch {
    // Fallback to empty
  }
  return [];
}

export const DailyQuoteNote: React.FC = () => {
  const todayISO = getTodayISO();

  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(QUOTE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { date: string; index: number };
        if (parsed.date === todayISO && typeof parsed.index === 'number') {
          return parsed.index % POSITIVE_QUOTES.length;
        }
      }
    } catch {
      // Fallback to today's deterministic quote
    }
    return getDayOfYearIndex();
  });

  const [notes, setNotes] = useState<DailyNoteItem[]>(() => loadInitialNotes(todayISO));
  const [noteInput, setNoteInput] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(
        QUOTE_STORAGE_KEY,
        JSON.stringify({ date: todayISO, index: quoteIndex })
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [quoteIndex, todayISO]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_LIST_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Ignore storage quota issues
    }
  }, [notes]);

  const quote = POSITIVE_QUOTES[quoteIndex];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % POSITIVE_QUOTES.length);
  };

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    const nextItem: DailyNoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      date: todayISO,
    };
    setNotes((prev) => [nextItem, ...prev]);
    setNoteInput('');
    try {
      localStorage.removeItem(NOTE_DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section
      aria-labelledby="daily-note-heading"
      className="h-full flex flex-col justify-between rounded-2xl border p-5"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--peach-soft) 42%, var(--bg-surface))',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-[var(--peach)] shrink-0" />
            <h2
              id="daily-note-heading"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              Daily Note
            </h2>
          </div>

          <button
            type="button"
            onClick={handleNextQuote}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
            title="Show another positive quote"
          >
            <RefreshCw className="h-3 w-3" />
            <span>New quote</span>
          </button>
        </div>

        {/* User's Added Notes Displayed Right Inside Daily Note */}
        {notes.length > 0 && (
          <ul className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {notes.map((item) => (
              <li
                key={item.id}
                className="group flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words">
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(item.id)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] opacity-70 hover:opacity-100 hover:bg-[var(--rose-soft)] hover:text-[var(--rose)] transition-colors"
                  aria-label="Remove note"
                  title="Remove note"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Positive Quote */}
        <blockquote className={notes.length > 0 ? 'mt-3 pt-2.5 border-t border-[var(--border-hairline)]/60' : 'mt-3.5'}>
          <p className="text-sm leading-relaxed font-medium text-[var(--text-primary)]">
            “{quote.text}”
          </p>
          <footer className="mt-1 text-xs text-[var(--text-secondary)]">
            — {quote.author}
          </footer>
        </blockquote>
      </div>

      {/* Add Personal Note Form */}
      <form onSubmit={handleAddNote} className="mt-4 pt-3 border-t border-[var(--border-hairline)]">
        <label
          htmlFor="daily-personal-note"
          className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1.5"
        >
          Note for today
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="daily-personal-note"
            rows={2}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            placeholder="Write a note for today and press Add..."
            className="flex-1 rounded-xl border px-3 py-2 text-xs leading-relaxed outline-none transition-colors focus:border-[var(--accent-primary)] resize-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={!noteInput.trim()}
            className="inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-45 shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </form>
    </section>
  );
};
