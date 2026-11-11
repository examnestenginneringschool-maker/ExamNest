"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  CurriculumSubject,
  StudentAcademicContext,
} from "@/lib/academic/student-context";
import { ProfileSlideOver } from "./ProfileSlideOver";

export type ProfileView =
  | "main"
  | "edit-profile"
  | "subjects"
  | "academic"
  | "security"
  | "session"
  | "feedback";

export type ProfileTab = ProfileView | "overview";

export type StudentProfileUser = {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailConfirmedAt: string | null;
  authProviders: string[];
  hasPasswordAuth: boolean;
  activeDeviceLabel: string;
  activeLoginAt: string | null;
};

type StudentProfileContextValue = {
  isOpen: boolean;
  activeTab: ProfileView;
  currentView: ProfileView;
  openProfile: (view?: ProfileTab) => void;
  closeProfile: () => void;
  setActiveTab: (view: ProfileView) => void;
  setCurrentView: (view: ProfileView) => void;
  student: StudentProfileUser;
  studentName: string;
  firstName: string;
  avatarUrl: string | null;
  setOptimisticName: (nextName: string) => void;
  setOptimisticAvatar: (nextAvatarUrl: string | null) => void;
  academic: StudentAcademicContext;
  subjects: CurriculumSubject[];
};

const StudentProfileContext = createContext<StudentProfileContextValue | null>(
  null
);

type StudentProfileProviderProps = {
  student: StudentProfileUser;
  academic: StudentAcademicContext;
  subjects: CurriculumSubject[];
  children: React.ReactNode;
};

export function StudentProfileProvider({
  student,
  academic,
  subjects,
  children,
}: StudentProfileProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ProfileView>("main");

  const [nameOverride, setNameOverride] = useState<{
    serverBase: string;
    value: string;
  } | null>(null);

  const [avatarOverride, setAvatarOverride] = useState<{
    serverBase: string | null;
    value: string | null;
  } | null>(null);

  const studentName =
    nameOverride && nameOverride.serverBase === student.fullName
      ? nameOverride.value
      : student.fullName;

  const firstName = studentName.trim().split(/\s+/)[0] || "Student";

  const avatarUrl =
    avatarOverride && avatarOverride.serverBase === student.avatarUrl
      ? avatarOverride.value
      : student.avatarUrl;

  const openProfile = useCallback((view: ProfileTab = "main") => {
    const resolvedView: ProfileView = view === "overview" ? "main" : view;
    setCurrentView(resolvedView);
    setIsOpen(true);
  }, []);

  const closeProfile = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setOptimisticName = useCallback(
    (nextName: string) => {
      setNameOverride({
        serverBase: student.fullName,
        value: nextName,
      });
    },
    [student.fullName]
  );

  const setOptimisticAvatar = useCallback(
    (nextAvatarUrl: string | null) => {
      setAvatarOverride({
        serverBase: student.avatarUrl,
        value: nextAvatarUrl,
      });
    },
    [student.avatarUrl]
  );

  const value = useMemo<StudentProfileContextValue>(
    () => ({
      isOpen,
      activeTab: currentView,
      currentView,
      openProfile,
      closeProfile,
      setActiveTab: setCurrentView,
      setCurrentView,
      student,
      studentName,
      firstName,
      avatarUrl,
      setOptimisticName,
      setOptimisticAvatar,
      academic,
      subjects,
    }),
    [
      isOpen,
      currentView,
      openProfile,
      closeProfile,
      student,
      studentName,
      firstName,
      avatarUrl,
      setOptimisticName,
      setOptimisticAvatar,
      academic,
      subjects,
    ]
  );

  return (
    <StudentProfileContext.Provider value={value}>
      {children}
      <ProfileSlideOver />
    </StudentProfileContext.Provider>
  );
}

export function useStudentProfile(): StudentProfileContextValue {
  const ctx = useContext(StudentProfileContext);
  if (!ctx) {
    throw new Error(
      "useStudentProfile must be used inside StudentProfileProvider."
    );
  }
  return ctx;
}

export function useOptionalStudentProfile(): StudentProfileContextValue | null {
  return useContext(StudentProfileContext);
}
