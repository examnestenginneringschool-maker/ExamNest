"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, UserCircle2 } from "lucide-react";
import { clearSingleDeviceSession } from "@/app/(auth)/actions";
import { useOptionalStudentProfile } from "@/components/profile/StudentProfileContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface UserMenuProps {
  studentName?: string;
  avatarUrl?: string | null;
}

export function StudentHeaderName({
  fallbackName = "Student",
}: {
  fallbackName?: string;
}) {
  const profile = useOptionalStudentProfile();
  return <>{profile?.studentName || fallbackName}</>;
}

export function UserMenu({
  studentName = "Student",
  avatarUrl,
}: UserMenuProps) {
  const router = useRouter();
  const profile = useOptionalStudentProfile();

  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const resolvedName = profile?.studentName || studentName;
  const resolvedAvatarUrl =
    profile !== null ? profile.avatarUrl : avatarUrl ?? null;

  const initials =
    resolvedName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleOpenProfile = () => {
    setOpen(false);
    if (profile) {
      profile.openProfile("overview");
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await clearSingleDeviceSession();
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut({ scope: "local" });
      if (typeof document !== "undefined") {
        document.cookie =
          "examnest_device_token=; path=/; max-age=0; SameSite=Lax";
      }
      setOpen(false);
      router.push("/sign-in");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-9 h-9 rounded-full ring-2 ring-slate-100 hover:ring-[#5B4DFF]/40 transition-all flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#5B4DFF] to-[#402ae6] text-white text-xs font-extrabold shadow-2xs cursor-pointer"
      >
        {resolvedAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedAvatarUrl}
            alt={resolvedName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white border border-slate-200/80 shadow-xl py-1.5 z-50 animate-auth-fade-in"
        >
          <div className="px-3.5 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#5B4DFF] shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {resolvedName}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 pl-5.5 truncate">
              {profile?.student.email || "Verified Student Session"}
            </p>
          </div>

          <div className="py-1">
            {profile && (
              <button
                type="button"
                role="menuitem"
                onClick={handleOpenProfile}
                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5B4DFF] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <UserCircle2 className="h-3.5 w-3.5 text-slate-400" />
                <span>View Profile</span>
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={handleSignOut}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
