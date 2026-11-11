import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { POLICY_BRANCHES, type LegalDocKey } from "@/lib/legal/navigation";

interface LegalFooterProps {
  className?: string;
  currentDoc?: LegalDocKey;
}

export function LegalFooter({ className = "", currentDoc }: LegalFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t border-slate-200/80 pt-8 pb-10 text-xs text-slate-500 ${className}`}
    >
      {/* Top Row: Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Logo size="xs" withText={true} />
          </Link>
          <span className="h-3 w-px bg-slate-200" />
          <span className="text-[11px] text-slate-400">
            The Engineering School
          </span>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        >
          Return to ExamNest Home →
        </Link>
      </div>

      {/* Middle Row: 3 Branch Directories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-100">
        {POLICY_BRANCHES.map((branch) => (
          <div key={branch.id}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2.5">
              {branch.label}
            </h3>
            <ul className="space-y-1.5">
              {branch.items.map((item) => {
                const isActive = currentDoc === item.key;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`text-xs transition-colors ${
                        isActive
                          ? "text-slate-950 font-bold underline decoration-slate-400 decoration-2 underline-offset-4"
                          : "text-slate-600 hover:text-slate-950 font-medium"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Row: Minimalist Legal Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 text-[11px] text-slate-400 leading-relaxed">
        <p>© {currentYear} ExamNest. All rights reserved.</p>
        <p className="sm:text-right">
          Independent initiative. All university trademarks belong to their
          respective authorities.
        </p>
      </div>
    </footer>
  );
}
