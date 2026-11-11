import { ScreenLoader } from "@/components/ui/ScreenLoader";

export default function SubjectLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-center">
      <ScreenLoader variant="subject" />
    </div>
  );
}
