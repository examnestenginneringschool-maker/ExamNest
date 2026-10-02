export const clerkAppearance = {
  variables: {
    colorPrimary: "#5B4DFF",
    colorText: "#1B1B2F",
    colorTextSecondary: "#717588",
    colorBackground: "#ffffff",
    colorInputBackground: "#FAF8FF",
    colorInputText: "#1B1B2F",
    borderRadius: "1rem",
    fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", system-ui, sans-serif',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "shadow-[0_20px_60px_-15px_rgba(27,27,47,0.08)] border border-[#e2e5f0] rounded-3xl bg-white backdrop-blur-xl p-6 sm:p-8 transition-all duration-300",
    headerTitle: "text-2xl font-extrabold tracking-tight text-[#1B1B2F]",
    headerSubtitle: "text-xs sm:text-sm text-[#717588] mt-1 font-medium",
    socialButtonsBlockButton:
      "border border-[#e2e5f0] bg-white hover:bg-[#FAF8FF] text-[#1B1B2F] font-semibold rounded-2xl transition-all duration-200 py-3 shadow-xs hover:border-[#5B4DFF]/30 hover:shadow-sm active:scale-[0.99]",
    socialButtonsBlockButtonText: "font-bold text-[#1B1B2F] text-xs sm:text-sm",
    dividerLine: "bg-[#e2e5f0]",
    dividerText: "text-[11px] font-bold text-[#717588] uppercase tracking-wider",
    formFieldLabel: "text-xs font-bold text-[#1B1B2F] mb-1.5",
    formFieldInput:
      "border border-[#e2e5f0] bg-[#FAF8FF] rounded-2xl px-4 py-3 text-[#1B1B2F] placeholder:text-[#717588]/60 focus:bg-white focus:border-[#5B4DFF] focus:ring-4 focus:ring-[#5B4DFF]/10 transition-all duration-200 text-sm font-medium",
    formButtonPrimary:
      "bg-[#5B4DFF] hover:bg-[#4A3BEE] text-white font-bold py-3 px-5 rounded-2xl shadow-[0_8px_20px_rgba(91,77,255,0.25)] hover:shadow-[0_12px_24px_rgba(91,77,255,0.35)] transition-all duration-200 text-sm active:scale-[0.98] cursor-pointer",
    footerActionLink: "text-[#5B4DFF] hover:text-[#4A3BEE] font-bold transition-colors underline-offset-2 hover:underline",
    footerActionText: "text-[#717588] text-xs sm:text-sm font-medium",
    identityPreviewText: "text-[#1B1B2F] font-bold",
    identityPreviewEditButton: "text-[#5B4DFF] hover:text-[#4A3BEE] font-semibold",
    formFieldSuccessText: "text-emerald-600 text-xs font-medium",
    formFieldErrorText: "text-rose-600 text-xs mt-1.5 font-medium",
    alertText: "text-rose-600 text-xs font-semibold",
    footer: "border-t border-[#f0f2f8] mt-4 pt-4",
  },
};
