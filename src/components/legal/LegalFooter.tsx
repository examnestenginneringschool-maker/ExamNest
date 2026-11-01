import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

interface LegalFooterProps {
  className?: string;
  currentDoc?: "privacy" | "terms";
}

export function LegalFooter({ className = "", currentDoc }: LegalFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t border-slate-200/80 pt-8 pb-10 text-xs text-slate-500 ${className}`}
    >
      {/* Top Row: Identity & Legal Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Logo size="xs" withText={true} />
          </Link>
          <span className="h-3 w-px bg-slate-200" />
          <span className="text-[11px] text-slate-400">
            The Engineering School
          </span>
        </div>

        {/* Right: Only Student Privacy Policy & Terms of Use */}
        <nav aria-label="Legal navigation" className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/privacy"
            className={`transition-colors ${
              currentDoc === "privacy"
                ? "text-slate-950 font-bold underline decoration-slate-400 decoration-2 underline-offset-4"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Student Privacy Policy
          </Link>
          <span className="text-slate-300 text-xs">•</span>
          <Link
            href="/terms"
            className={`transition-colors ${
              currentDoc === "terms"
                ? "text-slate-950 font-bold underline decoration-slate-400 decoration-2 underline-offset-4"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Terms of Use
          </Link>
        </nav>
      </div>

      {/* Bottom Row: Minimalist Legal Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 text-[11px] text-slate-400 leading-relaxed">
        <p>© {currentYear} ExamNest. All rights reserved.</p>
        <p className="sm:text-right">
          Independent initiative. All university trademarks belong to their respective authorities.
        </p>
      </div>
    </footer>
  );
}
