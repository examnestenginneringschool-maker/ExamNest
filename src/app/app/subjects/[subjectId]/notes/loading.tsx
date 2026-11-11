import { ScreenLoader } from "@/components/ui/ScreenLoader";

export default function NotesLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-center">
      <ScreenLoader variant="notes" />
    </div>
  );
}
