export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getTodayISO(): string {
  return formatDateISO(new Date());
}

export function addDaysISO(isoDate: string, days: number): string {
  const dt = parseLocalDate(isoDate);
  dt.setDate(dt.getDate() + days);
  return formatDateISO(dt);
}

export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatHeaderDate(now: Date = new Date()): string {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '';
  const today = getTodayISO();
  if (isoDate === today) return 'Today';
  if (isoDate === addDaysISO(today, 1)) return 'Tomorrow';
  if (isoDate === addDaysISO(today, -1)) return 'Yesterday';
  const dt = parseLocalDate(isoDate);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(isoDate: string): string {
  if (!isoDate) return '';
  const dt = parseLocalDate(isoDate);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(isoDate: string, status: string): boolean {
  if (status === 'Completed' || !isoDate) return false;
  return isoDate < getTodayISO();
}

/**
 * Returns Monday..Sunday ISO dates for a week offset from current week (0 = this week).
 */
export function getWeekDates(weekOffset = 0): {
  iso: string;
  dayName: string;
  shortDay: string;
  dayNumber: number;
  monthShort: string;
  isToday: boolean;
}[] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diffToMonday + weekOffset * 7
  );
  const todayISO = getTodayISO();

  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const iso = formatDateISO(dt);
    return {
      iso,
      dayName: dt.toLocaleDateString('en-US', { weekday: 'long' }),
      shortDay: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: dt.getDate(),
      monthShort: dt.toLocaleDateString('en-US', { month: 'short' }),
      isToday: iso === todayISO,
    };
  });
}

export function getWeekRangeLabel(weekOffset = 0): string {
  const dates = getWeekDates(weekOffset);
  const first = parseLocalDate(dates[0].iso);
  const last = parseLocalDate(dates[6].iso);
  const firstStr = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastStr = last.toLocaleDateString('en-US', {
    month: first.getMonth() === last.getMonth() ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${firstStr} – ${lastStr}`;
}

export function isDateInCurrentWeek(isoDate: string): boolean {
  const week = getWeekDates(0);
  return isoDate >= week[0].iso && isoDate <= week[6].iso;
}

export function isDateInCurrentMonth(isoDate: string): boolean {
  const now = new Date();
  const [y, m] = isoDate.split('-').map(Number);
  return y === now.getFullYear() && m === now.getMonth() + 1;
}

export function isDateInCurrentYear(isoDate: string): boolean {
  const now = new Date();
  const [y] = isoDate.split('-').map(Number);
  return y === now.getFullYear();
}

export interface CalendarCell {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Builds a 42-cell (6 rows x 7 cols) Monday-first calendar grid for (year, monthIndex 0-11).
 */
export function buildMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1; // Monday-first
  const startDate = new Date(year, monthIndex, 1 - offset);
  const todayISO = getTodayISO();

  return Array.from({ length: 42 }, (_, idx) => {
    const dt = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + idx
    );
    const iso = formatDateISO(dt);
    return {
      iso,
      dayNumber: dt.getDate(),
      inCurrentMonth: dt.getMonth() === monthIndex,
      isToday: iso === todayISO,
    };
  });
}
