"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  GraduationCap,
  Layers,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

import {
  completeOnboarding,
  getColleges,
  getCourses,
  getDepartments,
  getSemesters,
  getUniversities,
} from "@/app/onboarding/actions";
import { fullAcademicProfileSchema } from "@/lib/validation/onboarding";
import { Logo } from "@/components/brand/Logo";

export type University = {
  id: string;
  name: string;
  short_name: string;
};

export type College = {
  id: string;
  name: string;
};

export type CourseOption = {
  id: string;
  course: {
    id: string;
    name: string;
    short_name: string | null;
  } | null;
};

export type DepartmentOption = {
  id: string;
  department: {
    id: string;
    name: string;
    short_name: string;
  } | null;
};

export type Semester = {
  id: string;
  semester_number: number;
  name: string;
};

type Props = {
  initialUniversities?: University[];
};

const STEP_DEFINITIONS = [
  { step: 1, label: "University", icon: Building2 },
  { step: 2, label: "College", icon: GraduationCap },
  { step: 3, label: "Course", icon: BookOpen },
  { step: 4, label: "Department", icon: Layers },
  { step: 5, label: "Semester", icon: Calendar },
  { step: 6, label: "Confirm", icon: Sparkles },
];

export default function StudentOnboarding({ initialUniversities = [] }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [step, setStep] = useState(1);

  const [universities, setUniversities] = useState<University[]>(initialUniversities);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [universityId, setUniversityId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [collegeCourseId, setCollegeCourseId] = useState("");
  const [collegeCourseDepartmentId, setCollegeCourseDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [stepLoading, setStepLoading] = useState(initialUniversities.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load initial universities only if not provided by server
  useEffect(() => {
    if (initialUniversities.length > 0) return;

    let mounted = true;
    async function load() {
      try {
        setStepLoading(true);
        setError("");
        const data = await getUniversities();
        if (mounted) setUniversities(data);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load universities.");
        }
      } finally {
        if (mounted) setStepLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [initialUniversities]);

  function goToStep(nextStep: number) {
    setSearchQuery("");
    setStep(nextStep);
  }

  async function handleUniversitySelect(id: string) {
    if (id === universityId && colleges.length > 0) {
      goToStep(2);
      return;
    }

    try {
      setStepLoading(true);
      setError("");
      setUniversityId(id);
      setCollegeId("");
      setCollegeCourseId("");
      setCollegeCourseDepartmentId("");
      setSemesterId("");

      const data = await getColleges(id);
      setColleges(data);
      goToStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load colleges.");
    } finally {
      setStepLoading(false);
    }
  }

  async function handleCollegeSelect(id: string) {
    if (id === collegeId && courses.length > 0) {
      goToStep(3);
      return;
    }

    try {
      setStepLoading(true);
      setError("");
      setCollegeId(id);
      setCollegeCourseId("");
      setCollegeCourseDepartmentId("");
      setSemesterId("");

      const data = await getCourses(id);
      setCourses(data);
      goToStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load courses.");
    } finally {
      setStepLoading(false);
    }
  }

  async function handleCourseSelect(id: string) {
    if (id === collegeCourseId && departments.length > 0) {
      goToStep(4);
      return;
    }

    try {
      setStepLoading(true);
      setError("");
      setCollegeCourseId(id);
      setCollegeCourseDepartmentId("");
      setSemesterId("");

      const data = await getDepartments(id);
      setDepartments(data);
      goToStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load departments.");
    } finally {
      setStepLoading(false);
    }
  }

  async function handleDepartmentSelect(id: string) {
    if (!collegeCourseId) {
      setError("Please select a course first.");
      return;
    }

    if (id === collegeCourseDepartmentId && semesters.length > 0) {
      goToStep(5);
      return;
    }

    try {
      setStepLoading(true);
      setError("");
      setCollegeCourseDepartmentId(id);
      setSemesterId("");

      const data = await getSemesters(collegeCourseId);
      setSemesters(data);
      goToStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load semesters.");
    } finally {
      setStepLoading(false);
    }
  }

  function handleSemesterSelect(id: string) {
    setSemesterId(id);
    goToStep(6);
  }

  async function handleComplete() {
    const validation = fullAcademicProfileSchema.safeParse({
      universityId,
      collegeId,
      collegeCourseId,
      collegeCourseDepartmentId,
      semesterId,
    });

    if (!validation.success) {
      const firstErrorMessage =
        validation.error.issues[0]?.message ||
        "Please ensure all academic choices are selected.";
      setError(firstErrorMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await completeOnboarding(semesterId, collegeCourseDepartmentId);

      startTransition(() => {
        router.push("/app/dashboard");
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete onboarding.");
      setSubmitting(false);
    }
  }

  const selectedUniversity = universities.find((u) => u.id === universityId);
  const selectedCollege = colleges.find((c) => c.id === collegeId);
  const selectedCourse = courses.find((c) => c.id === collegeCourseId);
  const selectedDepartment = departments.find((d) => d.id === collegeCourseDepartmentId);
  const selectedSemester = semesters.find((s) => s.id === semesterId);

  // Filtered lists for instant search
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) return universities;
    const q = searchQuery.toLowerCase();
    return universities.filter(
      (u) => u.name.toLowerCase().includes(q) || u.short_name.toLowerCase().includes(q)
    );
  }, [universities, searchQuery]);

  const filteredColleges = useMemo(() => {
    if (!searchQuery.trim()) return colleges;
    const q = searchQuery.toLowerCase();
    return colleges.filter((c) => c.name.toLowerCase().includes(q));
  }, [colleges, searchQuery]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter((c) => {
      const name = c.course?.name?.toLowerCase() ?? "";
      const shortName = c.course?.short_name?.toLowerCase() ?? "";
      return name.includes(q) || shortName.includes(q);
    });
  }, [courses, searchQuery]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter((d) => {
      const name = d.department?.name?.toLowerCase() ?? "";
      const shortName = d.department?.short_name?.toLowerCase() ?? "";
      return name.includes(q) || shortName.includes(q);
    });
  }, [departments, searchQuery]);

  function canJumpToStep(targetStep: number) {
    if (targetStep === 1) return true;
    if (targetStep === 2) return !!universityId;
    if (targetStep === 3) return !!collegeId;
    if (targetStep === 4) return !!collegeCourseId;
    if (targetStep === 5) return !!collegeCourseDepartmentId;
    if (targetStep === 6) return !!semesterId;
    return false;
  }

  // Progress percentage for animated top bar
  const progressPercent = Math.round(((step - 1) / 5) * 100);

  return (
    <div className="mx-auto w-full max-w-4xl font-sans">
      {/* HEADER */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="mb-4">
          <Logo size="md" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#dee1f7] bg-[#ebedff]/80 px-4 py-1.5 text-xs font-bold text-[#5B4DFF] shadow-xs backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Personalized Academic Setup</span>
        </div>

        <h1 className="mt-3.5 text-3xl sm:text-4xl font-black tracking-tight text-[#1B1B2F]">
          Set up your academic profile
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-[#717588]">
          ExamNest organizes your notes, syllabus, and exam questions to match your exact university curriculum.
        </p>
      </div>

      {/* STEPPER PROGRESS NAVIGATION */}
      <div className="mb-8 bg-white/80 border border-[#e2e5f0] rounded-3xl p-4 sm:p-5 shadow-xs backdrop-blur-sm">
        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-[#ebedff] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#5B4DFF] to-[#F6C844] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progressPercent, 12)}%` }}
          />
        </div>

        <nav aria-label="Progress" className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
          {STEP_DEFINITIONS.map((def, idx) => {
            const isCompleted = step > def.step || (def.step === 6 && submitting);
            const isCurrent = step === def.step;
            const isClickable = canJumpToStep(def.step) && !submitting && !stepLoading;
            const Icon = def.icon;

            return (
              <div key={def.step} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(def.step)}
                  disabled={!isClickable}
                  className={`group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                    isCurrent
                      ? "bg-[#5B4DFF] text-white shadow-md shadow-[#5B4DFF]/25 ring-2 ring-[#5B4DFF]/20 scale-105"
                      : isCompleted
                      ? "bg-[#edeaff] text-[#5B4DFF] hover:bg-[#e4e0ff] cursor-pointer"
                      : "bg-[#FAF8FF] border border-[#e2e5f0] text-[#717588] cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-[#5B4DFF] text-white"
                        : "bg-[#ebedff] text-[#717588]"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : def.step}
                  </span>
                  <Icon className="h-3.5 w-3.5 opacity-90 hidden sm:inline-block" />
                  <span>{def.label}</span>
                </button>

                {idx < STEP_DEFINITIONS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded-full transition-all duration-300 hidden md:block ${
                      step > def.step ? "bg-[#5B4DFF]" : "bg-[#ebedff]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="relative overflow-hidden rounded-3xl border border-[#e2e5f0] bg-white p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(27,27,47,0.07)] backdrop-blur-xl">
        {/* Loading overlay top line when fetching next step */}
        {stepLoading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5B4DFF] via-[#F6C844] to-[#5B4DFF] animate-pulse" />
        )}

        {/* Selected Breadcrumb trail */}
        {step > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e8ebf6] bg-[#FAF8FF] px-4 py-2.5 text-xs text-[#1B1B2F] animate-in fade-in duration-300">
            <span className="font-extrabold text-[#717588] uppercase tracking-wider text-[10px]">
              Selections:
            </span>
            {selectedUniversity && (
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="font-bold text-[#5B4DFF] hover:underline"
              >
                {selectedUniversity.short_name || selectedUniversity.name}
              </button>
            )}
            {selectedCollege && (
              <>
                <ChevronRight className="h-3 w-3 text-[#717588]" />
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="font-bold text-[#5B4DFF] hover:underline max-w-[160px] truncate"
                  title={selectedCollege.name}
                >
                  {selectedCollege.name}
                </button>
              </>
            )}
            {selectedCourse && (
              <>
                <ChevronRight className="h-3 w-3 text-[#717588]" />
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="font-bold text-[#5B4DFF] hover:underline"
                >
                  {selectedCourse.course?.short_name || selectedCourse.course?.name}
                </button>
              </>
            )}
            {selectedDepartment && (
              <>
                <ChevronRight className="h-3 w-3 text-[#717588]" />
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="font-bold text-[#5B4DFF] hover:underline"
                >
                  {selectedDepartment.department?.short_name || selectedDepartment.department?.name}
                </button>
              </>
            )}
            {selectedSemester && (
              <>
                <ChevronRight className="h-3 w-3 text-[#717588]" />
                <span className="font-bold text-[#1B1B2F] bg-[#ebedff] px-2 py-0.5 rounded-full text-[11px]">
                  {selectedSemester.name}
                </span>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-700 flex items-center justify-between animate-in fade-in duration-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs text-rose-600 underline hover:text-rose-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: UNIVERSITY */}
        {step === 1 && (
          <div key="step-1" className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B1B2F]">
                  Select your university
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#717588]">
                  Choose the university your college is affiliated with.
                </p>
              </div>
              {universities.length > 3 && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter universities..."
                />
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {filteredUniversities.length === 0 ? (
                <EmptyState
                  text={
                    searchQuery
                      ? "No matching universities found."
                      : "No universities are currently available."
                  }
                />
              ) : (
                filteredUniversities.map((uni) => {
                  const isSelected = uni.id === universityId;
                  return (
                    <button
                      key={uni.id}
                      type="button"
                      disabled={stepLoading}
                      onClick={() => handleUniversitySelect(uni.id)}
                      className={`group relative rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#5B4DFF] bg-[#edeaff]/40 ring-2 ring-[#5B4DFF]/30 shadow-xs"
                          : "border-[#e2e5f0] bg-white hover:border-[#5B4DFF]/40 hover:bg-[#FAF8FF] hover:shadow-sm hover:-translate-y-0.5"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ebedff] text-[#5B4DFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-base font-extrabold text-[#1B1B2F] group-hover:text-[#5B4DFF] transition-colors">
                              {uni.short_name}
                            </p>
                            <p className="mt-1 text-xs text-[#717588] leading-snug">
                              {uni.name}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4DFF] text-white shrink-0 shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STEP 2: COLLEGE */}
        {step === 2 && (
          <div key="step-2" className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B1B2F]">
                  Choose your college
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#717588]">
                  Select the institution you currently attend.
                </p>
              </div>
              {colleges.length > 3 && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter colleges..."
                />
              )}
            </div>

            <div className="mt-6 space-y-2.5">
              {filteredColleges.length === 0 ? (
                <EmptyState
                  text={
                    searchQuery
                      ? "No matching colleges found."
                      : "No colleges registered under this university yet."
                  }
                />
              ) : (
                filteredColleges.map((col) => {
                  const isSelected = col.id === collegeId;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      disabled={stepLoading}
                      onClick={() => handleCollegeSelect(col.id)}
                      className={`group w-full flex items-center justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#5B4DFF] bg-[#edeaff]/40 ring-2 ring-[#5B4DFF]/30 shadow-xs"
                          : "border-[#e2e5f0] bg-white hover:border-[#5B4DFF]/40 hover:bg-[#FAF8FF] hover:shadow-xs hover:-translate-x-0.5"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ebedff] text-[#5B4DFF] flex items-center justify-center shrink-0">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm text-[#1B1B2F] group-hover:text-[#5B4DFF] transition-colors">
                          {col.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4DFF] text-white shrink-0 shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#717588] group-hover:text-[#5B4DFF] transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <BackButton onClick={() => goToStep(1)} disabled={stepLoading} />
          </div>
        )}

        {/* STEP 3: COURSE */}
        {step === 3 && (
          <div key="step-3" className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B1B2F]">
                  Select your course / degree
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#717588]">
                  Choose the academic program you are enrolled in.
                </p>
              </div>
              {courses.length > 3 && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter courses..."
                />
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {filteredCourses.length === 0 ? (
                <EmptyState
                  text={
                    searchQuery
                      ? "No matching courses found."
                      : "No courses listed for this college."
                  }
                />
              ) : (
                filteredCourses.map((opt) => {
                  const isSelected = opt.id === collegeCourseId;
                  const c = opt.course;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={stepLoading}
                      onClick={() => handleCourseSelect(opt.id)}
                      className={`group rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#5B4DFF] bg-[#edeaff]/40 ring-2 ring-[#5B4DFF]/30 shadow-xs"
                          : "border-[#e2e5f0] bg-white hover:border-[#5B4DFF]/40 hover:bg-[#FAF8FF] hover:shadow-sm hover:-translate-y-0.5"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ebedff] text-[#5B4DFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-base font-extrabold text-[#1B1B2F] group-hover:text-[#5B4DFF] transition-colors">
                              {c?.short_name || c?.name || "Course"}
                            </p>
                            {c?.short_name && c?.name && (
                              <p className="mt-1 text-xs text-[#717588]">{c.name}</p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4DFF] text-white shrink-0 shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <BackButton onClick={() => goToStep(2)} disabled={stepLoading} />
          </div>
        )}

        {/* STEP 4: DEPARTMENT */}
        {step === 4 && (
          <div key="step-4" className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B1B2F]">
                  Select your department / branch
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#717588]">
                  Select your major stream or engineering specialization.
                </p>
              </div>
              {departments.length > 3 && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter departments..."
                />
              )}
            </div>

            <div className="mt-6 space-y-2.5">
              {filteredDepartments.length === 0 ? (
                <EmptyState
                  text={
                    searchQuery
                      ? "No matching departments found."
                      : "No departments listed for this course."
                  }
                />
              ) : (
                filteredDepartments.map((opt) => {
                  const isSelected = opt.id === collegeCourseDepartmentId;
                  const d = opt.department;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={stepLoading}
                      onClick={() => handleDepartmentSelect(opt.id)}
                      className={`group w-full flex items-center justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#5B4DFF] bg-[#edeaff]/40 ring-2 ring-[#5B4DFF]/30 shadow-xs"
                          : "border-[#e2e5f0] bg-white hover:border-[#5B4DFF]/40 hover:bg-[#FAF8FF] hover:shadow-xs hover:-translate-x-0.5"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ebedff] text-[#5B4DFF] flex items-center justify-center shrink-0">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#1B1B2F] group-hover:text-[#5B4DFF] transition-colors">
                            {d?.short_name || d?.name || "Department"}
                          </span>
                          {d?.short_name && d?.name && (
                            <span className="ml-2 text-xs text-[#717588]">({d.name})</span>
                          )}
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4DFF] text-white shrink-0 shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#717588] group-hover:text-[#5B4DFF] transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <BackButton onClick={() => goToStep(3)} disabled={stepLoading} />
          </div>
        )}

        {/* STEP 5: SEMESTER */}
        {step === 5 && (
          <div key="step-5" className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1B1B2F]">
                Which semester are you in?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#717588]">
                Your syllabus, subjects, and study materials will match this semester.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {semesters.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState text="No semesters currently listed for this program." />
                </div>
              ) : (
                semesters.map((sem) => {
                  const isSelected = sem.id === semesterId;
                  return (
                    <button
                      key={sem.id}
                      type="button"
                      disabled={stepLoading}
                      onClick={() => handleSemesterSelect(sem.id)}
                      className={`group rounded-2xl border p-5 text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#5B4DFF] bg-[#edeaff]/70 ring-2 ring-[#5B4DFF]/30 text-[#5B4DFF] shadow-xs scale-102"
                          : "border-[#e2e5f0] bg-white hover:border-[#5B4DFF]/40 hover:bg-[#FAF8FF] hover:shadow-xs hover:scale-102 text-[#1B1B2F]"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#ebedff] text-[#5B4DFF] flex items-center justify-center mx-auto mb-2 font-black text-sm group-hover:bg-[#5B4DFF] group-hover:text-white transition-colors">
                        {sem.semester_number}
                      </div>
                      <p className="text-base font-black">{sem.name}</p>
                      <p className="mt-0.5 text-xs text-[#717588] font-medium">
                        Semester {sem.semester_number}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            <BackButton onClick={() => goToStep(4)} disabled={stepLoading} />
          </div>
        )}

        {/* STEP 6: REVIEW & CONFIRM */}
        {step === 6 && (
          <div key="step-6" className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1B1B2F]">
                Review your profile
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#717588]">
                Verify your academic placement. You can update this later anytime from your settings.
              </p>
            </div>

            {/* Motivational Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#edeaff] to-[#FAF8FF] border border-[#dee1f7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F6C844] text-[#6c5400] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1B1B2F]">
                  Curriculum Engine Ready
                </p>
                <p className="text-[11px] text-[#717588]">
                  Your custom dashboard, notes, and study units will be provisioned instantly.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e2e5f0] divide-y divide-[#f0f2f8] overflow-hidden bg-[#FAF8FF]">
              <ReviewRow
                label="University"
                value={selectedUniversity?.name || selectedUniversity?.short_name || "—"}
                badge={selectedUniversity?.short_name}
                onEdit={() => goToStep(1)}
              />
              <ReviewRow
                label="College"
                value={selectedCollege?.name || "—"}
                onEdit={() => goToStep(2)}
              />
              <ReviewRow
                label="Course"
                value={selectedCourse?.course?.name || selectedCourse?.course?.short_name || "—"}
                badge={selectedCourse?.course?.short_name || undefined}
                onEdit={() => goToStep(3)}
              />
              <ReviewRow
                label="Department"
                value={selectedDepartment?.department?.name || selectedDepartment?.department?.short_name || "—"}
                badge={selectedDepartment?.department?.short_name || undefined}
                onEdit={() => goToStep(4)}
              />
              <ReviewRow
                label="Current Semester"
                value={selectedSemester?.name || "—"}
                onEdit={() => goToStep(5)}
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => goToStep(5)}
                disabled={submitting}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#717588] transition hover:text-[#1B1B2F] disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Semesters
              </button>

              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting}
                className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F6C844] text-[#6c5400] hover:bg-[#5B4DFF] hover:text-white px-8 py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                    <span>Personalizing your workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Launch ExamNest</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  badge,
  onEdit,
}: {
  label: string;
  value: string;
  badge?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-white transition-colors">
      <div>
        <p className="text-[10px] font-extrabold text-[#717588] uppercase tracking-wider">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs sm:text-sm font-bold text-[#1B1B2F]">{value}</p>
          {badge && (
            <span className="rounded-md bg-[#edeaff] px-2 py-0.5 text-[10px] font-bold text-[#5B4DFF]">
              {badge}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-bold text-[#5B4DFF] hover:underline transition cursor-pointer"
      >
        Change
      </button>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717588]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#e2e5f0] bg-[#FAF8FF] py-2.5 pl-9 pr-3 text-xs font-medium text-[#1B1B2F] placeholder-[#717588]/60 transition-all focus:border-[#5B4DFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5B4DFF]/10"
      />
    </div>
  );
}

function BackButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#717588] transition hover:text-[#1B1B2F] disabled:opacity-50 cursor-pointer"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>Back</span>
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-[#e2e5f0] bg-[#FAF8FF] p-8 text-center text-xs font-semibold text-[#717588]">
      {text}
    </div>
  );
}