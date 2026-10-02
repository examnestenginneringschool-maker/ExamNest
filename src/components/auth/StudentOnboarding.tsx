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

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* HEADER */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          Personalized Study Setup
        </div>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          Set up your academic profile
        </h1>

        <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          ExamNest organizes your notes, syllabus, and exam questions to match your exact university curriculum.
        </p>
      </div>

      {/* STEPPER NAVIGATION */}
      <div className="mb-8 overflow-x-auto pb-2">
        <nav aria-label="Progress" className="flex items-center justify-between min-w-[560px]">
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
                  className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isCurrent
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600/20"
                      : isCompleted
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : def.step}
                  </span>
                  <Icon className="h-3.5 w-3.5 opacity-80" />
                  <span>{def.label}</span>
                </button>

                {idx < STEP_DEFINITIONS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition ${
                      step > def.step ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 md:p-10">
        {/* Loading overlay banner when fetching next step */}
        {stepLoading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-pulse" />
        )}

        {/* Selected Breadcrumb trail */}
        {step > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Selections:
            </span>
            {selectedUniversity && (
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="font-medium text-indigo-700 hover:underline"
              >
                {selectedUniversity.short_name || selectedUniversity.name}
              </button>
            )}
            {selectedCollege && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="font-medium text-indigo-700 hover:underline max-w-[150px] truncate"
                  title={selectedCollege.name}
                >
                  {selectedCollege.name}
                </button>
              </>
            )}
            {selectedCourse && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="font-medium text-indigo-700 hover:underline"
                >
                  {selectedCourse.course?.short_name || selectedCourse.course?.name}
                </button>
              </>
            )}
            {selectedDepartment && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="font-medium text-indigo-700 hover:underline"
                >
                  {selectedDepartment.department?.short_name || selectedDepartment.department?.name}
                </button>
              </>
            )}
            {selectedSemester && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-slate-900">{selectedSemester.name}</span>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs text-red-600 underline hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: UNIVERSITY */}
        {step === 1 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select your university</h2>
                <p className="mt-1 text-sm text-slate-500">
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

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      className={`group relative rounded-2xl border p-5 text-left transition duration-150 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30"
                          : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/70 hover:shadow-sm"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {uni.short_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 leading-snug">{uni.name}</p>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shrink-0">
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
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Choose your college</h2>
                <p className="mt-1 text-sm text-slate-500">
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
                      className={`group w-full flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30"
                          : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/70"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                        {col.name}
                      </span>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shrink-0">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition" />
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
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select your course / degree</h2>
                <p className="mt-1 text-sm text-slate-500">
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

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      className={`group rounded-2xl border p-5 text-left transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30"
                          : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/70"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {c?.short_name || c?.name || "Course"}
                          </p>
                          {c?.short_name && c?.name && (
                            <p className="mt-1 text-xs text-slate-500">{c.name}</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shrink-0">
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
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select your department / branch</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select your major stream or specialization.
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
                      className={`group w-full flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30"
                          : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/70"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                          {d?.short_name || d?.name || "Department"}
                        </span>
                        {d?.short_name && d?.name && (
                          <span className="ml-2 text-xs text-slate-400">({d.name})</span>
                        )}
                      </div>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shrink-0">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition" />
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
          <div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Which semester are you in?</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your syllabus, subjects, and study materials will match this semester.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                      className={`group rounded-2xl border p-5 text-center transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/30 text-indigo-700"
                          : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/70 text-slate-900"
                      } ${stepLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <p className="text-lg font-black">{sem.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400 font-medium">Semester {sem.semester_number}</p>
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
          <div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Review your profile</h2>
              <p className="mt-1 text-sm text-slate-500">
                Verify your academic placement. You can update this later anytime from settings.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
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

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => goToStep(5)}
                disabled={submitting}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Semesters
              </button>

              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Personalizing your workspace...
                  </>
                ) : (
                  <>
                    Launch ExamNest
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
    <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/80 transition">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm sm:text-base font-bold text-slate-900">{value}</p>
          {badge && (
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              {badge}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
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
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm font-medium text-slate-500">
      {text}
    </div>
  );
}