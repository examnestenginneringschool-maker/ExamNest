import { auth } from "@clerk/nextjs/server";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  return <>{children}</>;
}