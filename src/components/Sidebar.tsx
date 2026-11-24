import React from 'react';
import {
  Calendar,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  Settings,
  Target,
  X,
} from 'lucide-react';
import { NavView } from '../types';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  todayCompletionPct: number;
  todayDone: number;
  todayTotal: number;
}

const NAV_ITEMS: {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'weekly', label: 'Weekly Tasks', icon: ListTodo },
  { id: 'monthly', label: 'Monthly Tasks', icon: CalendarDays },
  { id: 'goals', label: 'Yearly Goals', icon: Target },
  { id: 'completed', label: 'Completed Tasks', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  mobileOpen,
  onCloseMobile,
  todayCompletionPct,
  todayDone,
  todayTotal,
}) => {
  const sidebarContent = (
    <div
      className="flex h-full flex-col justify-between p-5 border-r"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <button
            type="button"
            onClick={() => {
              onSelectView('dashboard');
              onCloseMobile();
            }}
            className="text-left focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] rounded-lg"
          >
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
              My Tasks
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)]"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        <nav aria-label="Primary navigation" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'var(--bg-subtle)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className="mt-6 rounded-2xl p-4 border"
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[var(--text-secondary)]">Today’s Focus</span>
          <span className="tabular-nums text-[var(--text-primary)]">{todayCompletionPct}%</span>
        </div>
        <div
          className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${todayCompletionPct}%`,
              backgroundColor: 'var(--sage)',
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)] tabular-nums">
          {todayDone} of {todayTotal} tasks done today
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-68 max-w-[82vw] h-full">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
};
