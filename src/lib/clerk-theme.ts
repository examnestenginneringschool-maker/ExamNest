export const clerkAppearance = {
  variables: {
    colorPrimary: "#4f46e5",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), sans-serif",
  },
  elements: {
    card: "shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-slate-200/80 rounded-2xl bg-white backdrop-blur-xl p-6 sm:p-8",
    headerTitle: "text-2xl font-bold tracking-tight text-slate-900",
    headerSubtitle: "text-sm text-slate-500 mt-1",
    socialButtonsBlockButton:
      "border border-slate-200/90 hover:bg-slate-50/80 text-slate-700 font-medium rounded-xl transition duration-150 py-2.5 shadow-xs",
    socialButtonsBlockButtonText: "font-semibold text-slate-700 text-sm",
    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-semibold text-slate-400 uppercase tracking-wider",
    formFieldLabel: "text-sm font-semibold text-slate-700 mb-1.5",
    formFieldInput:
      "border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition duration-150 text-sm",
    formButtonPrimary:
      "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition duration-150 text-sm active:scale-[0.99]",
    footerActionLink: "text-indigo-600 hover:text-indigo-700 font-semibold transition",
    footerActionText: "text-slate-500 text-sm",
    identityPreviewText: "text-slate-800 font-medium",
    identityPreviewEditButton: "text-indigo-600 hover:text-indigo-700 font-medium",
    formFieldSuccessText: "text-emerald-600 text-xs",
    formFieldErrorText: "text-rose-500 text-xs mt-1",
    alertText: "text-rose-600 text-sm",
  },
};
