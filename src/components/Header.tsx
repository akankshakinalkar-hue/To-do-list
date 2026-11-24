import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Menu, Palette, Plus, Search, X } from 'lucide-react';
import { THEMES } from '../themes';
import { Task, ThemeId } from '../types';
import { formatHeaderDate, formatShortDate, getGreeting, isOverdue } from '../utils/dateUtils';
import { CoffeeMascot } from './Mascots';

interface HeaderProps {
  userName: string;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  onOpenNewTask: () => void;
  alertTasks: Task[];
  onSelectTask: (task: Task) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  onOpenNewTask,
  alertTasks,
  onSelectTask,
  searchInputRef,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const greeting = getGreeting(today);
  const dateLabel = formatHeaderDate(today);

  return (
    <header
      className="sticky top-0 z-30 border-b px-4 sm:px-8 py-4 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-canvas) 92%, transparent)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-subtle)]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
            }}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4 text-[var(--text-primary)]" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)] truncate">
                {userName.trim() ? `${greeting}, ${userName.trim()}` : greeting}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">{dateLabel}</p>
            </div>
            <CoffeeMascot size={38} className="shrink-0" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Expandable / inline Search */}
          <div className="relative flex items-center">
            {searchOpen || searchQuery ? (
              <div
                className="flex items-center rounded-xl border px-3 py-1.5 transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                }}
              >
                <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                  className="w-36 sm:w-52 bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setSearchOpen(false);
                  }}
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-md hover:bg-[var(--bg-subtle)]"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 20);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
                aria-label="Search tasks"
                title="Search tasks ( / )"
              >
                <Search className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
            )}
          </div>

          {/* Notifications / Due Reminders Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((o) => !o);
                setThemeOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
              aria-label="Task reminders"
              aria-expanded={notifOpen}
            >
              <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
              {alertTasks.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white tabular-nums"
                  style={{ backgroundColor: 'var(--rose)' }}
                >
                  {alertTasks.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-lg z-40"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-hairline)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Due & Overdue Reminders
                  </span>
                  <span className="text-xs text-[var(--text-muted)] tabular-nums">
                    {alertTasks.length} open
                  </span>
                </div>

                {alertTasks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[var(--text-secondary)]">
                    All caught up for today. No pending or overdue reminders.
                  </p>
                ) : (
                  <ul className="mt-2 max-h-64 overflow-y-auto divide-y divide-[var(--border-hairline)]">
                    {alertTasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);
                      return (
                        <li key={task.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              onSelectTask(task);
                            }}
                            className="w-full py-2.5 px-1 text-left transition-colors hover:bg-[var(--bg-subtle)] rounded-lg"
                          >
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {task.title}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                              <span
                                style={{
                                  color: overdue ? 'var(--rose)' : 'var(--accent-primary)',
                                }}
                              >
                                {overdue ? 'Overdue' : formatShortDate(task.dueDate)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{task.priority}</span>
                              <span aria-hidden="true">·</span>
                              <span>{task.category}</span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Theme Customizer Popover */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => {
                setThemeOpen((o) => !o);
                setNotifOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
              aria-label="Customize pastel theme"
              aria-expanded={themeOpen}
            >
              <Palette className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>

            {themeOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl border p-3.5 shadow-lg z-40"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <p className="text-xs font-semibold text-[var(--text-secondary)] px-1 pb-2">
                  Pastel Theme
                </p>
                <div className="space-y-1">
                  {Object.values(THEMES).map((item) => {
                    const active = theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onThemeChange(item.id);
                          setThemeOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-[var(--bg-subtle)]"
                        style={{
                          backgroundColor: active ? 'var(--bg-subtle)' : 'transparent',
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="flex items-center -space-x-1">
                            {item.swatch.map((hex, i) => (
                              <span
                                key={i}
                                className="h-4 w-4 rounded-full border border-black/10"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </span>
                          <span className="text-[var(--text-primary)] font-medium">
                            {item.name}
                          </span>
                        </span>
                        {active && <Check className="h-4 w-4 text-[var(--accent-primary)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Primary Add Task CTA */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] whitespace-nowrap shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
