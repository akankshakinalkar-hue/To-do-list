import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarHeart,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Palette,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Priority, Task } from '../types';
import { buildMonthGrid, formatFullDate, getTodayISO, isOverdue } from '../utils/dateUtils';
import { CatMascot } from './Mascots';

interface FullCalendarPageProps {
  tasks: Task[];
  viewYear: number;
  viewMonth: number;
  selectedDate: string;
  searchQuery: string;
  onChangeMonth: (year: number, month: number) => void;
  onSelectDate: (iso: string) => void;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTaskForDate: (dateISO: string) => void;
}

type SoftColorId =
  | 'lavender'
  | 'rose'
  | 'peach'
  | 'butter'
  | 'sage'
  | 'sky'
  | 'mint'
  | 'blush';

type DayTopicId = 'exam' | 'event' | 'reminder' | 'personal' | 'custom';

interface SoftColorOption {
  id: SoftColorId;
  label: string;
  bg: string;
  border: string;
  dot: string;
  text: string;
}

const SOFT_CALENDAR_COLORS: SoftColorOption[] = [
  {
    id: 'lavender',
    label: 'Soft Lavender',
    bg: '#EDE6F5',
    border: '#CBBCE0',
    dot: '#9E87BF',
    text: '#4A3D5C',
  },
  {
    id: 'rose',
    label: 'Dusty Rose',
    bg: '#F6E4E6',
    border: '#DDB5BA',
    dot: '#BF8087',
    text: '#5A3A3E',
  },
  {
    id: 'peach',
    label: 'Soft Peach',
    bg: '#F8E8DA',
    border: '#E0C0A6',
    dot: '#CC8E66',
    text: '#5B402D',
  },
  {
    id: 'butter',
    label: 'Warm Buttercream',
    bg: '#F7F1D8',
    border: '#DFD2A2',
    dot: '#C5AF65',
    text: '#544B2A',
  },
  {
    id: 'sage',
    label: 'Meadow Sage',
    bg: '#E3EDE4',
    border: '#B8CEBB',
    dot: '#739478',
    text: '#364A39',
  },
  {
    id: 'sky',
    label: 'Powder Blue',
    bg: '#E4EEF6',
    border: '#B8CDE0',
    dot: '#789CBD',
    text: '#34495C',
  },
  {
    id: 'mint',
    label: 'Soft Mint',
    bg: '#E1F2EB',
    border: '#B3D9C9',
    dot: '#68A68D',
    text: '#2F4F43',
  },
  {
    id: 'blush',
    label: 'Blush Coral',
    bg: '#FAE5DF',
    border: '#E4BFB5',
    dot: '#C98272',
    text: '#5C3830',
  },
];

const TOPIC_OPTIONS: { id: DayTopicId; label: string }[] = [
  { id: 'exam', label: 'Exam' },
  { id: 'event', label: 'Event' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'personal', label: 'Personal' },
  { id: 'custom', label: 'Anything' },
];

interface DayHighlightEntry {
  topic: DayTopicId;
  colorId: SoftColorId;
  note: string;
}

const DAY_HIGHLIGHTS_STORAGE_KEY = 'my_tasks_calendar_exam_days_v1';
const DEFAULT_DAY_COLOR_KEY = 'my_tasks_calendar_exam_default_color_v1';

const WEEKDAY_HEADERS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRIORITY_DOT: Record<Priority, string> = {
  High: 'var(--rose)',
  Medium: 'var(--peach)',
  Low: 'var(--sage)',
};

function renderTopicIcon(topic: DayTopicId, className = 'h-3 w-3 shrink-0') {
  switch (topic) {
    case 'exam':
      return <BookOpen className={className} />;
    case 'event':
      return <CalendarHeart className={className} />;
    case 'reminder':
      return <Bell className={className} />;
    case 'personal':
      return <Sparkles className={className} />;
    default:
      return <Palette className={className} />;
  }
}

export const FullCalendarPage: React.FC<FullCalendarPageProps> = ({
  tasks,
  viewYear,
  viewMonth,
  selectedDate,
  searchQuery,
  onChangeMonth,
  onSelectDate,
  onToggleComplete,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onAddTaskForDate,
}) => {
  const [dayHighlights, setDayHighlights] = useState<Record<string, DayHighlightEntry>>(() => {
    try {
      const raw = localStorage.getItem(DAY_HIGHLIGHTS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, Partial<DayHighlightEntry>>;
      const normalized: Record<string, DayHighlightEntry> = {};
      Object.entries(parsed).forEach(([date, entry]) => {
        if (!entry) return;
        const validColor = SOFT_CALENDAR_COLORS.some((c) => c.id === entry.colorId)
          ? (entry.colorId as SoftColorId)
          : 'lavender';
        const validTopic = TOPIC_OPTIONS.some((t) => t.id === entry.topic)
          ? (entry.topic as DayTopicId)
          : 'custom';
        normalized[date] = {
          topic: validTopic,
          colorId: validColor,
          note: typeof entry.note === 'string' ? entry.note : '',
        };
      });
      return normalized;
    } catch {
      return {};
    }
  });

  const [defaultDayColor, setDefaultDayColor] = useState<SoftColorId>(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_DAY_COLOR_KEY) as SoftColorId | null;
      return saved && SOFT_CALENDAR_COLORS.some((c) => c.id === saved) ? saved : 'lavender';
    } catch {
      return 'lavender';
    }
  });

  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(DAY_HIGHLIGHTS_STORAGE_KEY, JSON.stringify(dayHighlights));
    } catch {
      // Ignore storage quota errors
    }
  }, [dayHighlights]);

  useEffect(() => {
    try {
      localStorage.setItem(DEFAULT_DAY_COLOR_KEY, defaultDayColor);
    } catch {
      // Ignore storage quota errors
    }
  }, [defaultDayColor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setColorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasks.forEach((t) => {
      const list = map.get(t.dueDate) || [];
      list.push(t);
      map.set(t.dueDate, list);
    });
    return map;
  }, [filteredTasks]);

  const selectedTasks = tasksByDate.get(selectedDate) || [];
  const selectedHighlight = dayHighlights[selectedDate];
  const activeColorId = selectedHighlight?.colorId || defaultDayColor;
  const activeColorOption =
    SOFT_CALENDAR_COLORS.find((c) => c.id === activeColorId) || SOFT_CALENDAR_COLORS[0];

  const handleTopicChange = (topic: 'none' | DayTopicId) => {
    if (topic === 'none') {
      setDayHighlights((prev) => {
        const next = { ...prev };
        delete next[selectedDate];
        return next;
      });
    } else {
      setDayHighlights((prev) => ({
        ...prev,
        [selectedDate]: prev[selectedDate]
          ? { ...prev[selectedDate], topic }
          : {
              topic,
              colorId: defaultDayColor,
              note: '',
            },
      }));
    }
  };

  const handleSelectDayColor = (colorId: SoftColorId) => {
    setDefaultDayColor(colorId);
    setDayHighlights((prev) => {
      if (!prev[selectedDate]) {
        return {
          ...prev,
          [selectedDate]: {
            topic: 'custom',
            colorId,
            note: '',
          },
        };
      }
      return {
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          colorId,
        },
      };
    });
    setColorDropdownOpen(false);
  };

  const handleDayNoteChange = (note: string) => {
    setDayHighlights((prev) => {
      const existing = prev[selectedDate];
      if (!existing) {
        if (!note.trim()) return prev;
        return {
          ...prev,
          [selectedDate]: {
            topic: 'custom',
            colorId: defaultDayColor,
            note,
          },
        };
      }
      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          note,
        },
      };
    });
  };

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

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthTasks = filteredTasks.filter((t) => t.dueDate.startsWith(monthPrefix));
  const monthDone = monthTasks.filter((t) => t.status === 'Completed').length;
  const monthHighlightCount = Object.keys(dayHighlights).filter((d) =>
    d.startsWith(monthPrefix)
  ).length;

  return (
    <div className="space-y-5">
      {/* Calendar Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {monthLabel}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 tabular-nums">
            {monthTasks.length} scheduled this month · {monthDone} completed
            {monthHighlightCount > 0
              ? ` · ${monthHighlightCount} colored ${monthHighlightCount === 1 ? 'day' : 'days'}`
              : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="inline-flex items-center rounded-xl border p-0.5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>
            <button
              type="button"
              onClick={handleJumpToday}
              className="px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onAddTaskForDate(selectedDate)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add for {formatFullDate(selectedDate).split(',')[0]}</span>
          </button>
        </div>
      </div>

      {/* Main Calendar + Day Agenda Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Full Monthly Grid */}
        <div
          className="xl:col-span-8 rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          {/* Weekday Headers */}
          <div
            className="grid grid-cols-7 border-b text-center text-xs font-medium text-[var(--text-secondary)]"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            {WEEKDAY_HEADERS.map((day, idx) => (
              <div key={day} className="py-2.5 px-1">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{WEEKDAY_SHORT[idx]}</span>
              </div>
            ))}
          </div>

          {/* 42-cell Calendar Grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const dayTasks = tasksByDate.get(cell.iso) || [];
              const entry = dayHighlights[cell.iso];
              const dayColor = entry
                ? SOFT_CALENDAR_COLORS.find((c) => c.id === entry.colorId) ||
                  SOFT_CALENDAR_COLORS[0]
                : null;
              const isSelected = cell.iso === selectedDate;
              const isLastRow = index >= 35;
              const isRightEdge = (index + 1) % 7 === 0;

              const cellBg = dayColor
                ? dayColor.bg
                : isSelected
                  ? 'color-mix(in srgb, var(--accent-soft) 55%, var(--bg-surface))'
                  : cell.inCurrentMonth
                    ? 'var(--bg-surface)'
                    : 'color-mix(in srgb, var(--bg-canvas) 65%, var(--bg-surface))';

              const topicMeta = entry
                ? TOPIC_OPTIONS.find((t) => t.id === entry.topic)
                : null;
              const displayNoteText = entry
                ? entry.note.trim()
                  ? entry.note.trim()
                  : entry.topic !== 'custom' && topicMeta
                    ? topicMeta.label
                    : ''
                : '';

              return (
                <div
                  key={cell.iso}
                  onClick={() => onSelectDate(cell.iso)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDate(cell.iso);
                    }
                  }}
                  aria-label={`${cell.iso}, ${displayNoteText ? `${displayNoteText}, ` : ''}${dayTasks.length} tasks`}
                  aria-pressed={isSelected}
                  className={`group relative min-h-[92px] sm:min-h-[126px] p-1.5 sm:p-2 transition-colors cursor-pointer flex flex-col min-w-0 ${
                    !isLastRow ? 'border-b' : ''
                  } ${!isRightEdge ? 'border-r' : ''}`}
                  style={{
                    borderColor: 'var(--border-hairline)',
                    backgroundColor: cellBg,
                    boxShadow: isSelected
                      ? `inset 0 0 0 2px ${dayColor ? dayColor.dot : 'var(--accent-primary)'}`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums"
                      style={{
                        backgroundColor: cell.isToday
                          ? 'var(--accent-primary)'
                          : isSelected
                            ? 'var(--bg-surface)'
                            : 'transparent',
                        color: cell.isToday
                          ? '#ffffff'
                          : dayColor
                            ? dayColor.text
                            : cell.inCurrentMonth
                              ? 'var(--text-primary)'
                              : 'var(--text-muted)',
                        fontWeight: cell.isToday || isSelected || dayColor ? 600 : 400,
                      }}
                    >
                      {cell.dayNumber}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(cell.iso);
                        onAddTaskForDate(cell.iso);
                      }}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex h-5 w-5 items-center justify-center rounded-md hover:bg-black/5 transition-opacity"
                      aria-label={`Add task on ${cell.iso}`}
                      title={`Add task on ${cell.iso}`}
                    >
                      <Plus className="h-3 w-3 text-[var(--text-secondary)]" />
                    </button>
                  </div>

                  {/* Full calendar day note displayed inside the cell */}
                  {dayColor && displayNoteText && (
                    <div
                      className="mt-1 flex items-start gap-1 text-[10px] sm:text-[11px] font-semibold leading-snug"
                      style={{ color: dayColor.text }}
                    >
                      <span className="mt-0.5 hidden sm:inline-flex shrink-0">
                        {renderTopicIcon(entry.topic, 'h-3 w-3')}
                      </span>
                      <span className="whitespace-normal break-words">{displayNoteText}</span>
                    </div>
                  )}

                  {/* Mobile dot summary */}
                  <div className="mt-1.5 flex sm:hidden flex-wrap items-center gap-1">
                    {dayTasks.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            t.status === 'Completed' ? 'var(--sage)' : PRIORITY_DOT[t.priority],
                        }}
                      />
                    ))}
                  </div>

                  {/* Desktop inline task labels (full sentences when space allows) */}
                  <div className="mt-1 hidden sm:flex flex-col gap-1">
                    {dayTasks.slice(0, 3).map((t) => {
                      const done = t.status === 'Completed';
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(t);
                          }}
                          className="w-full flex items-start gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] leading-snug transition-colors hover:bg-white/90"
                          style={{
                            backgroundColor: dayColor
                              ? 'rgba(255,255,255,0.68)'
                              : 'var(--bg-canvas)',
                          }}
                        >
                          <span
                            className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: done ? 'var(--sage)' : PRIORITY_DOT[t.priority],
                            }}
                          />
                          <span
                            className={`whitespace-normal break-words ${
                              done
                                ? 'line-through text-[var(--text-muted)]'
                                : 'text-[var(--text-primary)] font-medium'
                            }`}
                          >
                            {t.title}
                          </span>
                        </button>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="px-1 text-[10px] font-medium text-[var(--text-muted)] tabular-nums">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda, Day Color & Calendar Note Panel */}
        <aside
          className="xl:col-span-4 rounded-2xl border p-5 space-y-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">Selected Day</p>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">
                {formatFullDate(selectedDate)}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddTaskForDate(selectedDate)}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)] whitespace-nowrap"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Calendar-Only Day Color, Topic & Note */}
          <div
            className="rounded-xl border p-3.5 space-y-3"
            style={{
              backgroundColor: selectedHighlight ? activeColorOption.bg : 'var(--bg-canvas)',
              borderColor: selectedHighlight
                ? activeColorOption.border
                : 'var(--border-hairline)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Day Topic & Color
              </span>
              {selectedHighlight && (
                <button
                  type="button"
                  onClick={() => handleTopicChange('none')}
                  className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
                >
                  Clear day
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select day topic">
              <button
                type="button"
                onClick={() => handleTopicChange('none')}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: !selectedHighlight ? 'var(--bg-surface)' : 'transparent',
                  borderColor: !selectedHighlight
                    ? 'var(--accent-primary)'
                    : 'var(--border-hairline)',
                  color: !selectedHighlight ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                None
              </button>
              {TOPIC_OPTIONS.map((opt) => {
                const isActive = selectedHighlight?.topic === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTopicChange(opt.id)}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                      borderColor: isActive ? activeColorOption.dot : 'var(--border-hairline)',
                      color: isActive ? activeColorOption.text : 'var(--text-secondary)',
                    }}
                  >
                    {renderTopicIcon(opt.id, 'h-3 w-3')}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Soft Palette Color Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Day Color (soft palette)
              </label>
              <button
                type="button"
                onClick={() => setColorDropdownOpen((o) => !o)}
                aria-expanded={colorDropdownOpen}
                className="w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors hover:border-[var(--border-strong)]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3.5 w-3.5 rounded-full border shrink-0"
                    style={{
                      backgroundColor: activeColorOption.bg,
                      borderColor: activeColorOption.dot,
                    }}
                  />
                  <span className="truncate">{activeColorOption.label}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
              </button>

              {colorDropdownOpen && (
                <div
                  className="absolute left-0 right-0 mt-1.5 rounded-xl border p-1.5 shadow-lg z-30 max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                  }}
                  role="listbox"
                  aria-label="Soft palette colors for calendar days"
                >
                  {SOFT_CALENDAR_COLORS.map((option) => {
                    const isCurrent = activeColorId === option.id && Boolean(selectedHighlight);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => handleSelectDayColor(option.id)}
                        className="w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)]"
                        style={{
                          backgroundColor:
                            activeColorId === option.id ? 'var(--bg-canvas)' : 'transparent',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-full border shrink-0"
                            style={{
                              backgroundColor: option.bg,
                              borderColor: option.dot,
                            }}
                          />
                          <span>{option.label}</span>
                        </span>
                        {activeColorId === option.id && (
                          <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calendar Note input — displays in full on the calendar cell */}
            <div>
              <label
                htmlFor="calendar-day-note"
                className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1"
              >
                Calendar note (displayed on the day)
              </label>
              <textarea
                id="calendar-day-note"
                rows={2}
                value={selectedHighlight?.note || ''}
                onChange={(e) => handleDayNoteChange(e.target.value)}
                placeholder="Write anything for this day (e.g., Biology Midterm at 9am, Mom's birthday dinner)..."
                className="w-full rounded-xl border px-3 py-2 text-xs leading-relaxed outline-none focus:border-[var(--accent-primary)] resize-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Tasks List for Selected Date */}
          <div>
            {selectedTasks.length === 0 ? (
              <div className="py-7 text-center">
                <div className="flex justify-center mb-2">
                  <CatMascot size={36} />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedHighlight
                    ? selectedHighlight.note.trim() ||
                      `${
                        TOPIC_OPTIONS.find((t) => t.id === selectedHighlight.topic)?.label ||
                        'Highlighted'
                      } day marked`
                    : 'Clear schedule for this day'}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Click Add to schedule a task on {formatFullDate(selectedDate)}.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-hairline)]">
                {selectedTasks.map((task) => {
                  const done = task.status === 'Completed';
                  const overdue = isOverdue(task.dueDate, task.status);
                  return (
                    <li key={task.id} className="py-3 first:pt-1 last:pb-1 flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task.id)}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
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
                          className={`text-sm font-medium leading-snug ${
                            done
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                          />
                          <span>{task.priority}</span>
                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>
                          <span aria-hidden="true">·</span>
                          <span style={{ color: overdue ? 'var(--rose)' : 'var(--text-secondary)' }}>
                            {overdue ? 'Overdue' : task.status}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                          aria-label={`Edit "${task.title}"`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--rose-soft)] hover:text-[var(--rose)]"
                          aria-label={`Delete "${task.title}"`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
