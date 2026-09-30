"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  completeOnboarding,
  getColleges,
  getCourses,
  getDepartments,
  getSemesters,
  getUniversities,
} from "@/app/onboarding/actions";

type University = {
  id: string;
  name: string;
  short_name: string;
};

type College = {
  id: string;
  name: string;
};

type CourseOption = {
  id: string;
  course: {
    id: string;
    name: string;
    short_name: string | null;
  } | null;
};

type DepartmentOption = {
  id: string;
  department: {
    id: string;
    name: string;
    short_name: string;
  } | null;
};

type Semester = {
  id: string;
  semester_number: number;
  name: string;
};

export default function StudentOnboarding() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [universities, setUniversities] = useState<University[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [universityId, setUniversityId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [collegeCourseId, setCollegeCourseId] = useState("");
  const [
    collegeCourseDepartmentId,
    setCollegeCourseDepartmentId,
  ] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUniversities() {
      try {
        setLoading(true);
        setError("");

        const data = await getUniversities();

        setUniversities(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load universities."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUniversities();
  }, []);

  async function handleUniversitySelect(id: string) {
    try {
      setLoading(true);
      setError("");

      setUniversityId(id);

      setCollegeId("");
      setCollegeCourseId("");
      setCollegeCourseDepartmentId("");
      setSemesterId("");

      setCourses([]);
      setDepartments([]);
      setSemesters([]);

      const data = await getColleges(id);

      setColleges(data);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load colleges."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCollegeSelect(id: string) {
    try {
      setLoading(true);
      setError("");

      setCollegeId(id);

      setCollegeCourseId("");
      setCollegeCourseDepartmentId("");
      setSemesterId("");

      setDepartments([]);
      setSemesters([]);

      const data = await getCourses(id);

      setCourses(data);
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCourseSelect(id: string) {
    try {
      setLoading(true);
      setError("");

      setCollegeCourseId(id);

      setCollegeCourseDepartmentId("");
      setSemesterId("");

      setSemesters([]);

      const data = await getDepartments(id);

      setDepartments(data);
      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load departments."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDepartmentSelect(id: string) {
    if (!collegeCourseId) {
      setError("Please select a course first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      setCollegeCourseDepartmentId(id);
      setSemesterId("");

      const data = await getSemesters(collegeCourseId);

      setSemesters(data);
      setStep(5);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load semesters."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSemesterSelect(id: string) {
    setSemesterId(id);
    setStep(6);
  }

  async function handleComplete() {
    if (!collegeCourseDepartmentId) {
      setError("Please select your department.");
      return;
    }

    if (!semesterId) {
      setError("Please select a semester.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await completeOnboarding(
        semesterId,
        collegeCourseDepartmentId
      );

      router.push("/app/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete onboarding."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedUniversity = universities.find(
    (item) => item.id === universityId
  );

  const selectedCollege = colleges.find(
    (item) => item.id === collegeId
  );

  const selectedCourse = courses.find(
    (item) => item.id === collegeCourseId
  );

  const selectedDepartment = departments.find(
    (item) => item.id === collegeCourseDepartmentId
  );

  const selectedSemester = semesters.find(
    (item) => item.id === semesterId
  );

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold text-indigo-600">
          ExamNest setup
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
          Set up your academic profile
        </h1>

        <p className="mt-3 text-slate-600">
          Choose your university, college, course, department
          and semester so ExamNest can personalize your
          learning experience.
        </p>
      </div>

      {/* 6-step progress */}
      <div className="mb-8 grid grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className={`h-1.5 rounded-full transition ${
              item <= step
                ? "bg-indigo-600"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <UniversityStep
                universities={universities}
                onSelect={handleUniversitySelect}
              />
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <CollegeStep
                colleges={colleges}
                onSelect={handleCollegeSelect}
                onBack={() => setStep(1)}
              />
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <CourseStep
                courses={courses}
                onSelect={handleCourseSelect}
                onBack={() => setStep(2)}
              />
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <DepartmentStep
                departments={departments}
                onSelect={handleDepartmentSelect}
                onBack={() => setStep(3)}
              />
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <SemesterStep
                semesters={semesters}
                onSelect={handleSemesterSelect}
                onBack={() => setStep(4)}
              />
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <ConfirmationStep
                university={
                  selectedUniversity?.short_name ??
                  selectedUniversity?.name ??
                  ""
                }
                college={selectedCollege?.name ?? ""}
                course={
                  selectedCourse?.course?.short_name ??
                  selectedCourse?.course?.name ??
                  ""
                }
                department={
                  selectedDepartment?.department?.short_name ??
                  selectedDepartment?.department?.name ??
                  ""
                }
                semester={selectedSemester?.name ?? ""}
                submitting={submitting}
                onBack={() => setStep(5)}
                onComplete={handleComplete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UniversityStep({
  universities,
  onSelect,
}: {
  universities: University[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-950">
        Select your university
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Choose the university your college is affiliated
        with.
      </p>

      <div className="mt-6 space-y-3">
        {universities.length === 0 ? (
          <EmptyState text="No universities are available right now." />
        ) : (
          universities.map((university) => (
            <button
              key={university.id}
              type="button"
              onClick={() => onSelect(university.id)}
              className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              <p className="font-semibold text-slate-950">
                {university.short_name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {university.name}
              </p>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function CollegeStep({
  colleges,
  onSelect,
  onBack,
}: {
  colleges: College[];
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-950">
        Choose your college
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Select the college you currently attend.
      </p>

      <div className="mt-6 space-y-3">
        {colleges.length === 0 ? (
          <EmptyState text="No colleges are available for this university." />
        ) : (
          colleges.map((college) => (
            <button
              key={college.id}
              type="button"
              onClick={() => onSelect(college.id)}
              className="w-full rounded-xl border border-slate-200 p-4 text-left font-medium text-slate-950 transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              {college.name}
            </button>
          ))
        )}
      </div>

      <BackButton onClick={onBack} />
    </>
  );
}

function CourseStep({
  courses,
  onSelect,
  onBack,
}: {
  courses: CourseOption[];
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-950">
        Select your course
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Choose the course you are currently enrolled in.
      </p>

      <div className="mt-6 space-y-3">
        {courses.length === 0 ? (
          <EmptyState text="No courses are available for this college." />
        ) : (
          courses.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              <p className="font-semibold text-slate-950">
                {option.course?.short_name ??
                  option.course?.name ??
                  "Course"}
              </p>

              {option.course?.short_name &&
                option.course?.name && (
                  <p className="mt-1 text-sm text-slate-500">
                    {option.course.name}
                  </p>
                )}
            </button>
          ))
        )}
      </div>

      <BackButton onClick={onBack} />
    </>
  );
}

function DepartmentStep({
  departments,
  onSelect,
  onBack,
}: {
  departments: DepartmentOption[];
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-950">
        Select your department
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Choose your branch or department.
      </p>

      <div className="mt-6 space-y-3">
        {departments.length === 0 ? (
          <EmptyState text="No departments are available for this course." />
        ) : (
          departments.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              <p className="font-semibold text-slate-950">
                {option.department?.short_name ??
                  option.department?.name ??
                  "Department"}
              </p>

              {option.department?.name && (
                <p className="mt-1 text-sm text-slate-500">
                  {option.department.name}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      <BackButton onClick={onBack} />
    </>
  );
}

function SemesterStep({
  semesters,
  onSelect,
  onBack,
}: {
  semesters: Semester[];
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-950">
        Which semester are you in?
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Your subjects and study resources will be based on
        this semester.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {semesters.length === 0 ? (
          <div className="col-span-full">
            <EmptyState text="No semesters are available for this course." />
          </div>
        ) : (
          semesters.map((semester) => (
            <button
              key={semester.id}
              type="button"
              onClick={() => onSelect(semester.id)}
              className="rounded-xl border border-slate-200 p-4 font-medium text-slate-950 transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              {semester.name}
            </button>
          ))
        )}
      </div>

      <BackButton onClick={onBack} />
    </>
  );
}

function ConfirmationStep({
  university,
  college,
  course,
  department,
  semester,
  submitting,
  onBack,
  onComplete,
}: {
  university: string;
  college: string;
  course: string;
  department: string;
  semester: string;
  submitting: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-950">
        You&apos;re all set
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Review your academic details before entering
        ExamNest.
      </p>

      <div className="mt-6 divide-y divide-slate-200">
        <SummaryRow
          label="University"
          value={university}
        />

        <SummaryRow
          label="College"
          value={college}
        />

        <SummaryRow
          label="Course"
          value={course}
        />

        <SummaryRow
          label="Department"
          value={department}
        />

        <SummaryRow
          label="Semester"
          value={semester}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="font-medium text-slate-600 transition hover:text-slate-950 disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onComplete}
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : "Enter Dashboard"}
        </button>
      </div>
    </>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="max-w-[70%] text-right font-medium text-slate-950">
        {value || "—"}
      </span>
    </div>
  );
}

function BackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 font-medium text-slate-600 transition hover:text-slate-950"
    >
      ← Back
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <p className="text-sm text-slate-500">
        Loading...
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}