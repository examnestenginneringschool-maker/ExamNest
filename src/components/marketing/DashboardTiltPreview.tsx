"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  ArrowRight,
  Plus,
  FileCode,
} from "lucide-react";

interface DashboardTiltPreviewProps {
  studentName?: string;
  studentPhoto?: string | null;
  isAuthenticated?: boolean;
}

interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  code: string;
  category: string;
  units: number;
  hours: number;
  progress: number;
  status: "active" | "completed";
  colorClass: string;
  barColor: string;
}

const COURSES_DATA: CourseItem[] = [
  {
    id: "physics",
    title: "Physics-I",
    instructor: "Prof. S. Sengupta",
    code: "BS-PH101",
    category: "Basic Sci",
    units: 10,
    hours: 42,
    progress: 75,
    status: "active",
    colorClass: "bg-[#edeaff] text-[#402ae6]",
    barColor: "bg-[#402ae6]",
  },
  {
    id: "math",
    title: "Mathematics - IA",
    instructor: "Dr. A. Roy Chowdhury",
    code: "BS-M101",
    category: "Calculus",
    units: 14,
    hours: 58,
    progress: 30,
    status: "active",
    colorClass: "bg-[#ffdf91]/40 text-[#755b00]",
    barColor: "bg-[#f6c844]",
  },
  {
    id: "electrical",
    title: "Basic Electrical",
    instructor: "Prof. K. Mukherjee",
    code: "ES-EE101",
    category: "Done",
    units: 8,
    hours: 34,
    progress: 100,
    status: "completed",
    colorClass: "bg-emerald-50 text-emerald-700",
    barColor: "bg-emerald-500",
  },
  {
    id: "c-programming",
    title: "Programming in C",
    instructor: "Dr. P. Sen",
    code: "ES-CS101",
    category: "Algorithms",
    units: 12,
    hours: 46,
    progress: 48,
    status: "active",
    colorClass: "bg-[#e3dfff] text-[#3311dc]",
    barColor: "bg-[#5a4cfe]",
  },
];

interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  urgent?: boolean;
}

export function DashboardTiltPreview({
  studentName = "Student",
  studentPhoto,
  isAuthenticated = false,
}: DashboardTiltPreviewProps) {
  // --- Filter State ---
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // --- Calendar & Schedule State ---
  const [selectedDay, setSelectedDay] = useState<number>(26);

  // --- Tasks State ---
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "task-1",
      title: "Submit Lab Assignment 03",
      subtitle: "Due 28 Oct · Physics Lab",
      completed: false,
      urgent: true,
    },
    {
      id: "task-2",
      title: "Review 2023 PYQs",
      subtitle: "Mathematics - IA Matrix",
      completed: false,
    },
  ]);

  // --- 3D Tilt State & Physics (Low Sensitivity, Silky Smooth) ---
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const isHoveredRef = useRef(false);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const startTiltLoop = () => {
    if (animFrameRef.current) return;

    const tick = () => {
      if (!cardRef.current) return;

      currentXRef.current = lerp(currentXRef.current, targetXRef.current, 0.07);
      currentYRef.current = lerp(currentYRef.current, targetYRef.current, 0.07);

      const isNearRest =
        !isHoveredRef.current &&
        Math.abs(targetXRef.current - currentXRef.current) < 0.01 &&
        Math.abs(targetYRef.current - currentYRef.current) < 0.01;

      if (isNearRest) {
        cardRef.current.style.transform =
          "perspective(1600px) rotateX(0deg) rotateY(0deg) translateY(0px)";
        if (glareRef.current) glareRef.current.style.opacity = "0";
        animFrameRef.current = null;
        return;
      }

      cardRef.current.style.transform = `perspective(1600px) rotateX(${currentXRef.current.toFixed(
        2
      )}deg) rotateY(${currentYRef.current.toFixed(2)}deg) translateY(-2px)`;

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handleMouseEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    isHoveredRef.current = true;
    if (glareRef.current) glareRef.current.style.opacity = "0.25";
    startTiltLoop();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // TUNED LOW SENSITIVITY: Max rotation is gentle (+/- 2.2 deg instead of +/- 6.0 deg)
    const maxTiltDegrees = 2.2;
    targetXRef.current = ((y - centerY) / centerY) * -maxTiltDegrees;
    targetYRef.current = ((x - centerX) / centerX) * maxTiltDegrees;

    if (glareRef.current) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)`;
    }

    startTiltLoop();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    targetXRef.current = 0;
    targetYRef.current = 0;
    if (glareRef.current) glareRef.current.style.opacity = "0";
    startTiltLoop();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = () => {
    const title = window.prompt("Enter task name for your study schedule:");
    if (title && title.trim()) {
      setTasks((prev) => [
        {
          id: `task-${Date.now()}`,
          title: title.trim(),
          subtitle: "Added just now · Exam Prep",
          completed: false,
        },
        ...prev,
      ]);
    }
  };

  const filteredCourses = COURSES_DATA.filter((course) => {
    if (filter === "all") return true;
    return course.status === filter;
  });

  return (
    <div
      ref={containerRef}
      className="max-w-6xl mx-auto mt-14 sm:mt-18 [perspective:1600px] select-none"
    >
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-2xl sm:rounded-3xl bg-[#f7f8fc] border border-[#e2e5f0] shadow-2xl p-4 md:p-6 transition-transform duration-300 ease-out [transform-style:preserve-3d] will-change-transform"
        style={{
          transform:
            "perspective(1600px) rotateX(0deg) rotateY(0deg) translateY(0px)",
        }}
      >
        {/* Ambient Glare Layer (Low sensitivity gradient) */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-inherit opacity-0 transition-opacity duration-300 mix-blend-overlay z-30"
        />

        {/* Dashboard Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-[#e5e8f2]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e1e4ee] text-xs font-semibold text-[#181829] shadow-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#edeaff] text-[#402ae6] text-[11px] font-bold tracking-wide uppercase shadow-[0_1px_4px_rgba(64,42,230,0.1)]">
                MAKAUT · Maulana Abul Kalam Azad University of Technology
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#e1e4ee] text-[12px] font-semibold text-[#181829] shadow-xs">
              <span>B.Tech · CSE · Sem 1</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-[#e1e4ee]">
              {studentPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={studentPhoto}
                  alt={studentName}
                  className="w-8 h-8 rounded-full object-cover border border-[#402ae6]/30 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-[#171b2a] leading-tight">
                  {isAuthenticated ? studentName : "Student"}
                </div>
                <div className="text-[10px] text-[#717588] leading-tight">
                  CSE Student
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content: 70% Left Rail + 30% Right Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Welcome Card */}
            <div className="relative overflow-hidden p-6 rounded-2xl bg-white border border-[#e6e8f0] shadow-xs transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-[#402ae6] mb-1">
                    STUDENT ACADEMIC DASHBOARD
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#171b2a] flex items-center gap-2">
                    Welcome back,{" "}
                    <span className="text-[#5B4DFF] underline decoration-[#f6c844] decoration-4 underline-offset-4">
                      {isAuthenticated ? studentName : "Student"}
                    </span>
                    <span
                      aria-label="Waving hand"
                      className="text-xl waving-hand"
                      role="img"
                    >
                      👋
                    </span>
                  </h2>
                  <p className="text-xs text-[#5d5c73] mt-1 max-w-md leading-relaxed">
                    Keep learning, keep growing. Here&apos;s an overview of your
                    academic journey and ongoing semester prep.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#edeaff] text-[#402ae6] text-[11px] font-semibold transition-transform hover:scale-105">
                      B.Tech · Computer Science (MAKAUT)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#ebedff] text-[#171b2a] text-[11px] font-semibold transition-transform hover:scale-105">
                      Semester 1
                    </span>
                  </div>
                </div>

                {/* Stat Cards Row */}
                <div className="flex items-center gap-3 self-stretch md:self-auto">
                  <div className="flex-1 md:flex-initial p-3 rounded-xl bg-[#f7f8fd] border border-[#e5e8f4] min-w-[85px] text-center transition-all hover:-translate-y-0.5 hover:shadow-xs">
                    <div className="text-[10px] font-bold text-[#5d5c73] uppercase">
                      COURSES
                    </div>
                    <div className="text-lg font-black text-[#171b2a] mt-0.5">
                      7
                    </div>
                    <div className="text-[10px] text-[#402ae6] font-medium">
                      Active
                    </div>
                  </div>

                  <div className="flex-1 md:flex-initial p-3 rounded-xl bg-[#f7f8fd] border border-[#e5e8f4] min-w-[85px] text-center transition-all hover:-translate-y-0.5 hover:shadow-xs">
                    <div className="text-[10px] font-bold text-[#5d5c73] uppercase">
                      NOTES
                    </div>
                    <div className="text-lg font-black text-[#171b2a] mt-0.5">
                      10
                    </div>
                    <div className="text-[10px] text-[#755b00] font-medium">
                      Verified Units
                    </div>
                  </div>

                  <div className="flex-1 md:flex-initial p-3 rounded-xl bg-[#f7f8fd] border border-[#e5e8f4] min-w-[100px] flex items-center gap-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-xs">
                    <div className="relative w-9 h-9 shrink-0">
                      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#e2e5f2]"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        />
                        <path
                          className="text-[#402ae6] transition-all duration-1000 ease-out"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="70, 100"
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#171b2a]">
                        70%
                      </span>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#5d5c73] uppercase">
                        PROGRESS
                      </div>
                      <div className="text-[10px] text-[#171b2a] font-semibold">
                        4/6 Done
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Studying Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#171b2a]">
                    Continue Studying
                  </h3>
                  <div className="flex items-center gap-1 bg-[#ebedff] p-0.5 rounded-md text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setFilter("all")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        filter === "all"
                          ? "bg-white text-[#402ae6] font-bold shadow-xs"
                          : "text-[#5d5c73] hover:text-[#171b2a]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter("active")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        filter === "active"
                          ? "bg-white text-[#402ae6] font-bold shadow-xs"
                          : "text-[#5d5c73] hover:text-[#171b2a]"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter("completed")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        filter === "completed"
                          ? "bg-white text-[#402ae6] font-bold shadow-xs"
                          : "text-[#5d5c73] hover:text-[#171b2a]"
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#402ae6] hover:underline flex items-center gap-0.5 group cursor-pointer">
                  <span>See all</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>

              {/* 4 Course Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl bg-white border border-[#e5e8f4] hover:border-[#402ae6]/40 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#171b2a] group-hover:text-[#402ae6] transition-colors">
                          {course.title}
                        </h4>
                        <div className="text-[11px] text-[#717588]">
                          {course.instructor}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${course.colorClass}`}
                      >
                        {course.code} · {course.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-[#717588] mt-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-[#402ae6]" />
                        {course.units} Units
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#402ae6]" />
                        {course.hours} hrs
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f0f2f8]">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-[#717588]">Completed</span>
                        <span className="font-bold text-[#402ae6]">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#ebedff] overflow-hidden">
                        <div
                          className={`progress-bar-fill h-1.5 rounded-full ${course.barColor}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Subject Updates & Activity Section */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#5B4DFF] live-pulse-dot" />
                  <h3 className="text-sm font-bold text-[#171b2a]">
                    Recent Subject Updates &amp; Activity
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#171b2a] text-white font-medium cursor-pointer">
                    All Updates
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#5d5c73] border border-[#e1e4ee] hover:bg-slate-50 transition-colors cursor-pointer">
                    New Notes
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#5d5c73] border border-[#e1e4ee] hover:bg-slate-50 transition-colors cursor-pointer">
                    Video Lectures
                  </span>
                </div>
              </div>

              {/* Update Cards with Left Accent Borders */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-white border border-[#e5e8f4] border-l-4 border-l-[#5B4DFF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:translate-x-0.5 transition-transform">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#171b2a]">
                        Physics-I (BS-PH101)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#edeaff] text-[#5B4DFF]">
                        New Video Lecture
                      </span>
                      <span className="text-[10px] text-[#717588]">
                        · 2 hours ago
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5d5c73]">
                      Unit 3: Quantum Mechanics · 3 New Lecture Modules &amp;
                      Solved Wave Packet Visualizer added by Prof. S. Sengupta
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5B4DFF] hover:underline shrink-0 group-hover:translate-x-1 transition-transform cursor-pointer">
                    <span>Watch Lecture</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#e5e8f4] border-l-4 border-l-[#1B1B2F] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:translate-x-0.5 transition-transform">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#171b2a]">
                        Programming for Problem Solving (ES-CS101)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ebedff] text-[#1B1B2F]">
                        Curriculum Modified
                      </span>
                      <span className="text-[10px] text-[#717588]">
                        · Yesterday
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5d5c73]">
                      Module 4 Pointers &amp; Dynamic Memory Allocation notes
                      updated with supplementary practice problems and sample
                      code
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#171b2a] hover:underline shrink-0 group-hover:translate-x-1 transition-transform cursor-pointer">
                    <span>Review Changes</span>
                    <FileCode className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Schedule Rail (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Calendar Widget */}
            <div className="p-4 rounded-2xl bg-white border border-[#e5e8f4] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#171b2a]">
                  October 2026
                </span>
                <div className="flex items-center gap-1 text-[#717588]">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#717588] mb-1">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                <span className="text-[#c4c0ff]/60 py-1">28</span>
                <span className="text-[#c4c0ff]/60 py-1">29</span>
                <span className="text-[#c4c0ff]/60 py-1">30</span>
                {[
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                  18, 19, 20, 21, 22, 23, 24, 25,
                ].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`py-1 rounded-full transition-colors cursor-pointer ${
                      selectedDay === d
                        ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                        : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedDay(26)}
                  className={`py-1 rounded-full transition-all cursor-pointer ${
                    selectedDay === 26
                      ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                      : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                  }`}
                >
                  26
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(27)}
                  className={`py-1 rounded-full transition-all cursor-pointer ${
                    selectedDay === 27
                      ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                      : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                  }`}
                >
                  27
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(28)}
                  className={`py-1 rounded-full transition-all relative cursor-pointer ${
                    selectedDay === 28
                      ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                      : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                  }`}
                >
                  28
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(29)}
                  className={`py-1 rounded-full transition-all cursor-pointer ${
                    selectedDay === 29
                      ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                      : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                  }`}
                >
                  29
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(30)}
                  className={`py-1 rounded-full transition-all cursor-pointer ${
                    selectedDay === 30
                      ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                      : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                  }`}
                >
                  30
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(31)}
                  className={`py-1 rounded-full transition-all cursor-pointer ${
                    selectedDay === 31
                      ? "bg-[#402ae6] text-white font-bold shadow-xs scale-105"
                      : "text-[#171b2a] hover:bg-[#edeaff] hover:text-[#402ae6]"
                  }`}
                >
                  31
                </button>
                <span className="text-[#c4c0ff]/60 py-1">1</span>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="p-4 rounded-2xl bg-white border border-[#e5e8f4] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#171b2a]">
                  Selected Day&apos;s Schedule
                </h4>
                <span className="text-[10px] font-semibold text-[#402ae6] px-2 py-0.5 rounded-full bg-[#edeaff]">
                  {selectedDay} Oct
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-[#f7f8fd] border border-[#e8ebf6] flex items-start gap-2.5 hover:bg-[#edeaff]/30 transition-all cursor-pointer">
                  <span className="px-1.5 py-0.5 rounded bg-[#edeaff] text-[#402ae6] text-[10px] font-bold">
                    12:00
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#171b2a]">
                      Physics-I Tutorial
                    </div>
                    <div className="text-[10px] text-[#717588]">
                      Room 304 · Offline Lab
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#f7f8fd] border border-[#e8ebf6] flex items-start gap-2.5 hover:bg-[#ffdf91]/20 transition-all cursor-pointer">
                  <span className="px-1.5 py-0.5 rounded bg-[#ffdf91]/40 text-[#755b00] text-[10px] font-bold">
                    14:30
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#171b2a]">
                      Engg. Mechanics Live
                    </div>
                    <div className="text-[10px] text-[#717588]">
                      Sem 1 Combined Section
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminders & Tasks */}
            <div className="p-4 rounded-2xl bg-white border border-[#e5e8f4] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#171b2a]">
                  Reminders &amp; Tasks
                </h4>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="text-[10px] font-bold text-[#402ae6] hover:underline transition-transform hover:scale-105 cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add new</span>
                </button>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    className={`p-2.5 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-start gap-2.5 hover:bg-white hover:shadow-xs transition-all cursor-pointer block select-none ${
                      task.completed ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="mt-0.5 rounded text-[#402ae6] focus:ring-0 transition-transform active:scale-90 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div
                        className={`text-xs font-semibold text-[#171b2a] transition-all ${
                          task.completed
                            ? "line-through text-[#717588]"
                            : "text-[#171b2a]"
                        }`}
                      >
                        {task.title}
                      </div>
                      <div
                        className={`text-[10px] font-medium ${
                          task.urgent ? "text-rose-500" : "text-[#717588]"
                        }`}
                      >
                        {task.subtitle}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
