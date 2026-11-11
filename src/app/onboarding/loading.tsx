import { ScreenLoader } from "@/components/ui/ScreenLoader";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-center">
      <ScreenLoader variant="onboarding" />
    </div>
  );
}
