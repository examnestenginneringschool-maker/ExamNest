import { ResetPasswordPortal } from "@/components/auth/ResetPasswordPortal";

export const metadata = {
  title: "Account Recovery & Reset Password | Qoncepto",
  description:
    "Securely update your Qoncepto password or proceed directly to your semester workspace.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordPortal />;
}
