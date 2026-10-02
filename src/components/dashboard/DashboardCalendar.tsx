"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";

export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: "exam" | "test" | "assignment" | "revision" | "lecture";
  time?: string;
};

function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: "def-0",
    date: "2026-10-03",
    title: "Semester 1 Study Plan & Goals Review",
    category: "revision",
    time: "10:00 AM",
  },
  {
    id: "def-1",
    date: "2026-10-26",
    title: "Formula Cheat Sheet Revision",
    category: "revision",
    time: "06:00 PM",
  },
  {
    id: "def-2",
    date: "2026-10-27",
    title: "Lab Assignment 03 Due",
    category: "assignment",
    time: "11:59 PM",
  },
  {
    id: "def-3",
    date: "2026-10-28",
    title: "Physics-I Module Test 02",
    category: "exam",
    time: "10:00 AM",
  },
];

const CATEGORY_COLORS: Record<
  CalendarEvent["category"],
  { dot: string; badge: string; text: string }
> = {
  exam: {
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    text: "Exam",
  },
  test: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    text: "Test",
  },
  assignment: {
    dot: "bg-indigo-600",
    badge: "bg-indigo-100 text-indigo-700",
    text: "Assignment",
  },
  revision: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-800",
    text: "Revision",
  },
  lecture: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    text: "Lecture",
  },
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatSelectedDate(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  const dayName = SHORT_WEEKDAYS[dt.getDay()] || "Mon";
  const monthName = SHORT_MONTHS[m] || "Oct";
  return `${dayName}, ${monthName} ${d}`;
}

const emptySubscribe = () => () => {};

let cachedCalendarJson: string | null = null;
let cachedCalendarEvents: CalendarEvent[] = DEFAULT_EVENTS;

function getCalendarEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return DEFAULT_EVENTS;
  try {
    const raw = localStorage.getItem("examnest_calendar_events");
    if (raw === cachedCalendarJson) {
      return cachedCalendarEvents;
    }
    if (!raw) {
      cachedCalendarJson = null;
      cachedCalendarEvents = DEFAULT_EVENTS;
      return DEFAULT_EVENTS;
    }
    cachedCalendarJson = raw;
    cachedCalendarEvents = JSON.parse(raw);
    return cachedCalendarEvents;
  } catch {
    return DEFAULT_EVENTS;
  }
}

function subscribeCalendar(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("examnest:calendar-update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("examnest:calendar-update", callback);
  };
}

function saveCalendarEvents(updated: CalendarEvent[]): void {
  try {
    const raw = JSON.stringify(updated);
    cachedCalendarJson = raw;
    cachedCalendarEvents = updated;
    localStorage.setItem("examnest_calendar_events", raw);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("examnest:calendar-update"));
  window.dispatchEvent(new Event("storage"));
}

export function DashboardCalendar() {
  const [todayKey] = useState(getTodayDateKey);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<CalendarEvent["category"]>("assignment");
  const [newTime, setNewTime] = useState("10:00 AM");

  // SSR-safe hydration tracking to prevent HTML mismatches
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const storedEvents = useSyncExternalStore(
    subscribeCalendar,
    getCalendarEvents,
    () => DEFAULT_EVENTS
  );

  const events = isHydrated ? storedEvents : DEFAULT_EVENTS;

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Days calculations
  const { calendarCells } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    type Cell = {
      dayNumber: number;
      isCurrentMonth: boolean;
      dateKey: string;
      isToday: boolean;
    };

    const cells: Cell[] = [];

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateKey = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      cells.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateKey,
        isToday: false,
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const isToday = dateKey === todayKey;
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateKey,
        isToday,
      });
    }

    // 3. Next month leading days
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateKey = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      cells.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateKey,
        isToday: false,
      });
    }

    return { calendarCells: cells };
  }, [year, month, todayKey]);

  // Events on selected date
  const selectedEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateKey);
  }, [events, selectedDateKey]);

  // Map of dateKey -> dots
  const eventDotsMap = useMemo(() => {
    const map = new Map<string, CalendarEvent["category"][]>();
    for (const ev of events) {
      const list = map.get(ev.date) || [];
      if (!list.includes(ev.category)) {
        list.push(ev.category);
      }
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: "ev-" + Date.now(),
      date: selectedDateKey,
      title: newTitle.trim(),
      category: newCategory,
      time: newTime || "All Day",
    };

    saveCalendarEvents([...events, newEv]);
    setNewTitle("");
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    saveCalendarEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] flex flex-col gap-3">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={handlePrevMonth}
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="font-bold text-sm text-slate-900 tracking-tight">
          {MONTH_NAMES[month]} {year}
        </span>

        <button
          onClick={handleNextMonth}
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-1">
        <span>SU</span>
        <span>MO</span>
        <span>TU</span>
        <span>WE</span>
        <span>TH</span>
        <span>FR</span>
        <span>SA</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center text-xs font-medium items-center">
        {calendarCells.map((cell, idx) => {
          const isSelected = cell.dateKey === selectedDateKey;
          const dots = eventDotsMap.get(cell.dateKey) || [];

          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedDateKey(cell.dateKey);
                setIsAddingEvent(false);
              }}
              type="button"
              className={`h-8 flex flex-col items-center justify-center relative rounded-full transition-all cursor-pointer ${
                  !cell.isCurrentMonth
                    ? "text-slate-300"
                    : cell.isToday
                    ? isSelected
                      ? "bg-slate-900 text-white font-bold shadow-xs ring-2 ring-indigo-500"
                      : "bg-slate-900 text-white font-bold shadow-xs hover:bg-slate-800"
                    : isSelected
                    ? "bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-500/30"
                    : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="leading-none text-xs">{cell.dayNumber}</span>

              {/* Event indicators */}
              {dots.length > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5 absolute bottom-0.5">
                  {dots.slice(0, 3).map((cat, dIdx) => (
                    <span
                      key={dIdx}
                      className={`w-1 h-1 rounded-full ${CATEGORY_COLORS[cat]?.dot || "bg-indigo-600"}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda & Event Creator */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CalendarIcon className="h-3.5 w-3.5 text-indigo-600" />
            <span suppressHydrationWarning>
              {formatSelectedDate(selectedDateKey)}
            </span>
          </div>

          <button
            onClick={() => setIsAddingEvent((prev) => !prev)}
            type="button"
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            {isAddingEvent ? (
              <>
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                <span>Add Event</span>
              </>
            )}
          </button>
        </div>

        {/* Add Event Form */}
        {isAddingEvent && (
          <form
            onSubmit={handleAddEvent}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2 text-xs animate-in fade-in duration-150"
          >
            <input
              type="text"
              placeholder="Event title (e.g. Physics Viva)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />

            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as CalendarEvent["category"])
                }
                className="flex-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs"
              >
                <option value="assignment">Assignment</option>
                <option value="test">Test</option>
                <option value="exam">Exam</option>
                <option value="revision">Revision</option>
                <option value="lecture">Lecture</option>
              </select>

              <input
                type="text"
                placeholder="10:00 AM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-24 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Save Event
            </button>
          </form>
        )}

        {/* Events List for selected date */}
        {selectedEvents.length > 0 ? (
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedEvents.map((ev) => (
              <div
                key={ev.id}
                className="group flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      CATEGORY_COLORS[ev.category]?.dot || "bg-indigo-600"
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">
                      {ev.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ev.time} · {CATEGORY_COLORS[ev.category]?.text}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEvent(ev.id)}
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                  title="Delete event"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 text-center py-1.5">
            No events scheduled for this date.
          </p>
        )}
      </div>
    </div>
  );
}
