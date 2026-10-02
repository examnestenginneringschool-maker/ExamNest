"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Plus,
  X,
  FileEdit,
  History,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Check,
  type LucideIcon,
} from "lucide-react";

type StudentTask = {
  id: string;
  title: string;
  subtitle: string;
};

const DEFAULT_TASKS: StudentTask[] = [
  {
    id: "task-1",
    title: "Submit Lab Assignment 03",
    subtitle: "Due 28 Oct · Physics Lab",
  },
  {
    id: "task-2",
    title: "Review 2023 PYQs",
    subtitle: "Mathematics - IA Matrix",
  },
  {
    id: "task-3",
    title: "Derive Wave Packet Equations",
    subtitle: "Physics-I · Unit 3",
  },
];

type ThemeConfig = {
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  icon: LucideIcon;
};

const ROW_THEMES: ThemeConfig[] = [
  {
    iconBg: "bg-indigo-50",
    iconBorder: "border-indigo-100",
    iconColor: "text-indigo-600",
    icon: FileEdit,
  },
  {
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-100",
    iconColor: "text-amber-600",
    icon: History,
  },
  {
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-100",
    iconColor: "text-emerald-600",
    icon: CheckCircle2,
  },
  {
    iconBg: "bg-purple-50",
    iconBorder: "border-purple-100",
    iconColor: "text-purple-600",
    icon: Sparkles,
  },
  {
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-100",
    iconColor: "text-blue-600",
    icon: BookOpen,
  },
];

const emptySubscribe = () => () => {};

let cachedTasksJson: string | null = null;
let cachedTasks: StudentTask[] = DEFAULT_TASKS;

function getStudentTasks(): StudentTask[] {
  if (typeof window === "undefined") return DEFAULT_TASKS;
  try {
    const raw = localStorage.getItem("examnest_student_tasks");
    if (raw === cachedTasksJson) {
      return cachedTasks;
    }
    if (!raw) {
      cachedTasksJson = null;
      cachedTasks = DEFAULT_TASKS;
      return DEFAULT_TASKS;
    }
    cachedTasksJson = raw;
    cachedTasks = JSON.parse(raw);
    return cachedTasks;
  } catch {
    return DEFAULT_TASKS;
  }
}

function subscribeTasks(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("examnest:tasks-update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("examnest:tasks-update", callback);
  };
}

function saveStudentTasks(updated: StudentTask[]): void {
  try {
    const raw = JSON.stringify(updated);
    cachedTasksJson = raw;
    cachedTasks = updated;
    localStorage.setItem("examnest_student_tasks", raw);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("examnest:tasks-update"));
  window.dispatchEvent(new Event("storage"));
}

export function RemindersTasksWidget() {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [completingIds, setCompletingIds] = useState<string[]>([]);

  // SSR-safe hydration tracking to prevent initial DOM mismatch
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const storedTasks = useSyncExternalStore(
    subscribeTasks,
    getStudentTasks,
    () => DEFAULT_TASKS
  );

  const tasks = isHydrated ? storedTasks : DEFAULT_TASKS;

  const handleCompleteTask = (id: string) => {
    // 1. Mark as completing to trigger wipe-out animation
    setCompletingIds((prev) => [...prev, id]);

    // 2. Remove after animation finishes
    setTimeout(() => {
      saveStudentTasks(tasks.filter((t) => t.id !== id));
      setCompletingIds((prev) => prev.filter((item) => item !== id));
    }, 450);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: StudentTask = {
      id: "task-" + Date.now(),
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "Daily study goal",
    };

    saveStudentTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewSubtitle("");
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 tracking-tight">
          Reminders &amp; Tasks
        </h3>

        <button
          onClick={() => setIsAdding((prev) => !prev)}
          type="button"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
        >
          {isAdding ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Add new</span>
            </>
          )}
        </button>
      </div>

      {/* Inline Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2 text-xs animate-in fade-in duration-200"
        >
          <input
            type="text"
            placeholder="Task description (e.g. Submit Lab 3)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900"
          />

          <input
            type="text"
            placeholder="Due date / subject (e.g. Due 28 Oct · Physics)"
            value={newSubtitle}
            onChange={(e) => setNewSubtitle(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900"
          />

          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-200/70 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-xs shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="flex flex-col gap-2.5">
        {tasks.map((task, index) => {
          const theme = ROW_THEMES[index % ROW_THEMES.length];
          const Icon = theme.icon;
          const isCompleting = completingIds.includes(task.id);

          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all duration-400 ease-out group ${
                isCompleting
                  ? "opacity-0 -translate-x-8 scale-95 max-h-0 py-0 my-0 overflow-hidden pointer-events-none"
                  : "opacity-100 translate-x-0 scale-100 max-h-24"
              }`}
            >
              {/* Distinct theme color icon box */}
              <div
                className={`w-8 h-8 rounded-lg bg-white border ${theme.iconBorder} ${theme.iconColor} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Title & Subtitle */}
              <div className="flex-1 flex flex-col min-w-0">
                <span
                  className={`text-xs font-semibold text-slate-800 group-hover:text-slate-900 leading-snug truncate ${
                    isCompleting ? "line-through text-slate-400" : ""
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {task.subtitle}
                </span>
              </div>

              {/* Checkbox with instant wipe-out on click */}
              <button
                type="button"
                onClick={() => handleCompleteTask(task.id)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                  isCompleting
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-indigo-500 bg-white group-hover:border-slate-400"
                }`}
                title="Mark as completed"
              >
                {isCompleting ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-xs opacity-0 group-hover:opacity-20 bg-indigo-600" />
                )}
              </button>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <span className="text-xl mb-1">🎉</span>
            <p className="text-xs font-semibold text-slate-700">
              All tasks completed!
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enjoy your progress or add new goals for today.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
