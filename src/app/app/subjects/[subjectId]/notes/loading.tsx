import { ScreenLoader } from "@/components/ui/ScreenLoader";
import { LoaderTransition } from "@/components/ui/ViewTransitions";

export default function NotesLoading() {
  return (
    <LoaderTransition>
      <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-center">
        <ScreenLoader variant="notes" />
      </div>
    </LoaderTransition>
  );
}
