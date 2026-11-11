"use client";

import React, { useEffect } from "react";
import { ChevronLeft, X } from "lucide-react";
import { ProfileAcademicView } from "./ProfileAcademicView";
import { ProfileEditView } from "./ProfileEditView";
import { ProfileFeedbackView } from "./ProfileFeedbackView";
import { ProfileMainView } from "./ProfileMainView";
import { ProfileSecurityTab } from "./ProfileSecurityTab";
import { ProfileSessionView } from "./ProfileSessionView";
import { ProfileSubjectsTab } from "./ProfileSubjectsTab";
import {
  useStudentProfile,
  type ProfileView,
} from "./StudentProfileContext";

const VIEW_TITLES: Record<ProfileView, string> = {
  main: "Profile",
  "edit-profile": "Edit Profile",
  subjects: "Subject Progression",
  academic: "Academic Stream",
  security: "Change Password",
  session: "Manage Devices",
  feedback: "Help & Feedback",
};

export function ProfileSlideOver() {
  const { isOpen, currentView, setCurrentView, closeProfile } =
    useStudentProfile();

  // Escape key listener & body scroll-lock while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeProfile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeProfile]);

  const isMain = currentView === "main";

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
        isOpen ? "visible" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Subtle Backdrop Blur */}
      <div
        onClick={closeProfile}
        className={`absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Right-Side Slide-Over Drawer with Top Warm Ambient Glow (Rounded on Left Edges Only) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Student Profile"
        className={`absolute right-0 top-0 bottom-0 w-full max-w-[430px] rounded-tl-[24px] rounded-bl-[24px] rounded-tr-none rounded-br-none sm:rounded-tl-[28px] sm:rounded-bl-[28px] overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF9FC] to-[#F5F3FB] border-l border-slate-200/70 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Soft top-right warm glow (matching reference image) */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-b from-amber-300/20 via-orange-200/10 to-transparent blur-3xl" />

        {/* Top Drawer Header */}
        <div className="relative z-10 px-6 pt-5 pb-3 shrink-0 flex items-center justify-between gap-3">
          {isMain ? (
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Profile
            </h2>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentView("main")}
              className="inline-flex items-center gap-1.5 py-1 px-2.5 -ml-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/90 border border-transparent hover:border-slate-200/80 transition-all duration-200 ease-out cursor-pointer hover:-translate-x-0.5 hover:scale-[1.02] active:scale-95 shadow-2xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          {!isMain && (
            <h3 className="text-sm font-extrabold text-slate-800 truncate">
              {VIEW_TITLES[currentView]}
            </h3>
          )}

          <button
            type="button"
            onClick={closeProfile}
            aria-label="Close profile panel"
            className="w-8 h-8 rounded-full border border-slate-200/80 bg-white/90 hover:bg-white text-slate-400 hover:text-slate-700 shadow-2xs flex items-center justify-center transition-all duration-200 ease-out cursor-pointer hover:scale-110 hover:shadow-xs active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body Content with Smooth Redirection Transition */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-2">
          {isOpen && (
            <div key={currentView} className="animate-profile-view">
              {currentView === "main" && <ProfileMainView />}
              {currentView === "edit-profile" && <ProfileEditView />}
              {currentView === "subjects" && <ProfileSubjectsTab />}
              {currentView === "academic" && <ProfileAcademicView />}
              {currentView === "security" && <ProfileSecurityTab />}
              {currentView === "session" && <ProfileSessionView />}
              {currentView === "feedback" && <ProfileFeedbackView />}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
