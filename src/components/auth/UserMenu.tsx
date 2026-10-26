"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface UserMenuProps {
  studentName?: string;
  avatarUrl?: string | null;
}

export function UserMenu({
  studentName = "Student",
  avatarUrl,
}: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials =
    studentName
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
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
        className="w-9 h-9 rounded-full ring-2 ring-slate-100 hover:ring-[#5B4DFF]/40 transition-all flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#5B4DFF] to-[#402ae6] text-white text-xs font-extrabold shadow-2xs cursor-pointer"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={studentName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-white border border-slate-200/80 shadow-xl py-1.5 z-50 animate-auth-fade-in">
          <div className="px-3.5 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#5B4DFF] shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {studentName}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 pl-5.5">
              Verified Student Session
            </p>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/app/dashboard");
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5B4DFF] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
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
