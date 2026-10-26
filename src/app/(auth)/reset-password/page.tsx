import { ResetPasswordPortal } from "@/components/auth/ResetPasswordPortal";

export const metadata = {
  title: "Account Recovery & Reset Password | ExamNest",
  description:
    "Securely update your ExamNest password or proceed directly to your semester workspace.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordPortal />;
}
