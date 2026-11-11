export function formatSubjectType(type: string): string {
  if (!type) return "Subject";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
