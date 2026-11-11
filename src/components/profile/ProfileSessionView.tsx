"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Laptop,
  ShieldCheck,
} from "lucide-react";
import { formatDeviceLabel } from "@/lib/utils/device";
import { useStudentProfile } from "./StudentProfileContext";

export function ProfileSessionView() {
  const { student } = useStudentProfile();

  const clientDeviceLabel =
    typeof navigator !== "undefined"
      ? formatDeviceLabel(navigator.userAgent)
      : student.activeDeviceLabel;

  const displayDevice =
    student.activeDeviceLabel && student.activeDeviceLabel !== "Web Browser"
      ? student.activeDeviceLabel
      : clientDeviceLabel;

  const formattedLoginTime = student.activeLoginAt
    ? new Date(student.activeLoginAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Active now";

  return (
    <div className="space-y-4 pb-6">
      {/* Active Device Card */}
      <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Laptop className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Current Active Device
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Authorized session for this browser
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        </div>

        <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Hardware / OS</span>
            <span className="font-bold text-slate-800">{displayDevice}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
              <Clock className="h-3.5 w-3.5" />
              Session Verified
            </span>
            <span className="font-semibold text-slate-700">
              {formattedLoginTime}
            </span>
          </div>
        </div>
      </section>

      {/* Single Device Policy Info Card */}
      <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              Single-Device Protection
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              ExamNest enforces strict single-session security. Signing in on
              another device or browser automatically terminates older sessions
              and alerts you via email so your notes and coursework stay safe.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
