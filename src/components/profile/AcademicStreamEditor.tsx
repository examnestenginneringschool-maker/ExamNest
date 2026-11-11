"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import {
  getColleges,
  getCourses,
  getDepartments,
  getSemesters,
  getUniversities,
} from "@/app/onboarding/actions";
import { updateStudentAcademicStream } from "@/app/app/profile-actions";
import type { StudentAcademicContext } from "@/lib/academic/student-context";
import { fullAcademicProfileSchema } from "@/lib/validation/onboarding";

type UniversityOption = { id: string; name: string; short_name: string };
type CollegeOption = { id: string; name: string };
type CourseOption = {
  id: string;
  course: { id: string; name: string; short_name: string | null } | null;
};
type DepartmentOption = {
  id: string;
  department: { id: string; name: string; short_name: string } | null;
};
type SemesterOption = { id: string; semester_number: number; name: string };

type AcademicStreamEditorProps = {
  academic: StudentAcademicContext;
  onCancel: () => void;
  onSaved: () => void;
};

export function AcademicStreamEditor({
  academic,
  onCancel,
  onSaved,
}: AcademicStreamEditorProps) {
  const router = useRouter();

  const [universityId, setUniversityId] = useState(academic.university.id);
  const [collegeId, setCollegeId] = useState(academic.college.id);
  const [collegeCourseId, setCollegeCourseId] = useState(
    academic.semester.college_course_id
  );
  const [collegeCourseDepartmentId, setCollegeCourseDepartmentId] = useState(
    academic.collegeCourseDepartmentId
  );
  const [semesterId, setSemesterId] = useState(academic.semester.id);

  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pre-hydrate all dropdown options for the student's current academic stream
  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        setInitialLoading(true);
        const [unis, cols, crs, depts, sems] = await Promise.all([
          getUniversities(),
          getColleges(academic.university.id),
          getCourses(academic.college.id),
          getDepartments(academic.semester.college_course_id),
          getSemesters(academic.semester.college_course_id),
        ]);
        if (!active) return;
        setUniversities(unis);
        setColleges(cols);
        setCourses(crs);
        setDepartments(depts);
        setSemesters(sems);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load academic options."
          );
        }
      } finally {
        if (active) setInitialLoading(false);
      }
    }
    void hydrate();
    return () => {
      active = false;
    };
  }, [
    academic.university.id,
    academic.college.id,
    academic.semester.college_course_id,
  ]);

  const handleUniversityChange = async (nextUniId: string) => {
    setError("");
    setUniversityId(nextUniId);
    setCollegeId("");
    setCollegeCourseId("");
    setCollegeCourseDepartmentId("");
    setSemesterId("");
    setColleges([]);
    setCourses([]);
    setDepartments([]);
    setSemesters([]);

    if (!nextUniId) return;
    try {
      setLoadingStep("college");
      const cols = await getColleges(nextUniId);
      setColleges(cols);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load colleges.");
    } finally {
      setLoadingStep(null);
    }
  };

  const handleCollegeChange = async (nextCollegeId: string) => {
    setError("");
    setCollegeId(nextCollegeId);
    setCollegeCourseId("");
    setCollegeCourseDepartmentId("");
    setSemesterId("");
    setCourses([]);
    setDepartments([]);
    setSemesters([]);

    if (!nextCollegeId) return;
    try {
      setLoadingStep("course");
      const crs = await getCourses(nextCollegeId);
      setCourses(crs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses.");
    } finally {
      setLoadingStep(null);
    }
  };

  const handleCourseChange = async (nextCollegeCourseId: string) => {
    setError("");
    setCollegeCourseId(nextCollegeCourseId);
    setCollegeCourseDepartmentId("");
    setSemesterId("");
    setDepartments([]);
    setSemesters([]);

    if (!nextCollegeCourseId) return;
    try {
      setLoadingStep("dept-sem");
      const [depts, sems] = await Promise.all([
        getDepartments(nextCollegeCourseId),
        getSemesters(nextCollegeCourseId),
      ]);
      setDepartments(depts);
      setSemesters(sems);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load departments and semesters."
      );
    } finally {
      setLoadingStep(null);
    }
  };

  const isDirty =
    semesterId !== academic.semester.id ||
    collegeCourseDepartmentId !== academic.collegeCourseDepartmentId;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = fullAcademicProfileSchema.safeParse({
      universityId,
      collegeId,
      collegeCourseId,
      collegeCourseDepartmentId,
      semesterId,
    });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ||
          "Please select all academic fields."
      );
      return;
    }

    try {
      setSaving(true);
      const res = await updateStudentAcademicStream(
        semesterId,
        collegeCourseDepartmentId
      );
      if (!res.success) {
        setError(res.error || "Could not update academic stream.");
        return;
      }
      router.refresh();
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save academic changes."
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 py-5 text-xs font-medium text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#5B4DFF]" />
        <span>Loading available streams...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-auth-fade-in"
    >
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200/80 px-3 py-2 text-[11px] font-medium text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          University
        </label>
        <select
          value={universityId}
          onChange={(e) => void handleUniversityChange(e.target.value)}
          disabled={saving}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#5B4DFF] focus:bg-white focus:outline-none transition-colors"
        >
          <option value="">Select university</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.short_name ? `${u.short_name} — ${u.name}` : u.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          College {loadingStep === "college" && "· Loading..."}
        </label>
        <select
          value={collegeId}
          onChange={(e) => void handleCollegeChange(e.target.value)}
          disabled={saving || !universityId || loadingStep === "college"}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#5B4DFF] focus:bg-white focus:outline-none transition-colors disabled:opacity-50"
        >
          <option value="">Select college</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Course {loadingStep === "course" && "· Loading..."}
        </label>
        <select
          value={collegeCourseId}
          onChange={(e) => void handleCourseChange(e.target.value)}
          disabled={saving || !collegeId || loadingStep === "course"}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#5B4DFF] focus:bg-white focus:outline-none transition-colors disabled:opacity-50"
        >
          <option value="">Select course</option>
          {courses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.course?.short_name || item.course?.name || "Course"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Branch
          </label>
          <select
            value={collegeCourseDepartmentId}
            onChange={(e) => {
              setError("");
              setCollegeCourseDepartmentId(e.target.value);
            }}
            disabled={saving || !collegeCourseId || loadingStep === "dept-sem"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#5B4DFF] focus:bg-white focus:outline-none transition-colors disabled:opacity-50"
          >
            <option value="">Select branch</option>
            {departments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.department?.short_name || item.department?.name || "Dept"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Semester
          </label>
          <select
            value={semesterId}
            onChange={(e) => {
              setError("");
              setSemesterId(e.target.value);
            }}
            disabled={saving || !collegeCourseId || loadingStep === "dept-sem"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:border-[#5B4DFF] focus:bg-white focus:outline-none transition-colors disabled:opacity-50"
          >
            <option value="">Select sem</option>
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                Sem {sem.semester_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !isDirty || !semesterId || !collegeCourseDepartmentId}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B4DFF] hover:bg-[#4B3DE8] text-white text-xs font-bold shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Save Stream</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
