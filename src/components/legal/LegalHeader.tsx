import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

interface LegalHeaderProps {
  activeTab: "privacy" | "terms";
}

export function LegalHeader({ activeTab }: LegalHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Home Backlink */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" withText={true} />
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Platform</span>
          </Link>
        </div>

        {/* Center / Right: Clean Document Switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <Link
              href="/privacy"
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "privacy"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Student Privacy
            </Link>
            <Link
              href="/terms"
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === "terms"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Terms of Use
            </Link>
          </nav>

          <Link
            href="/sign-in"
            className="hidden md:inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors ml-2"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
