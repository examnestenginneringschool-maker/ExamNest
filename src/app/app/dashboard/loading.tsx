import { ScreenLoader } from "@/components/ui/ScreenLoader";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-center">
      <ScreenLoader variant="dashboard" />
    </div>
  );
}
