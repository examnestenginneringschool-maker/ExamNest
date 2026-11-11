import { ScreenLoader } from "@/components/ui/ScreenLoader";
import { LoaderTransition } from "@/components/ui/ViewTransitions";

export default function SubjectLoading() {
  return (
    <LoaderTransition>
      <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-center">
        <ScreenLoader variant="subject" />
      </div>
    </LoaderTransition>
  );
}
