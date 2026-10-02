import { describe, expect, it } from "vitest";
import { formatSubjectType } from "@/components/dashboard/SubjectCard";

describe("Subject Formatting Utility", () => {
  it("formats snake_case types to Title Case", () => {
    expect(formatSubjectType("theory_practical")).toBe("Theory Practical");
    expect(formatSubjectType("sessional")).toBe("Sessional");
    expect(formatSubjectType("mandatory_course")).toBe("Mandatory Course");
  });

  it("handles empty or null-like values gracefully", () => {
    expect(formatSubjectType("")).toBe("Subject");
  });

  it("formats single-word types correctly", () => {
    expect(formatSubjectType("theory")).toBe("Theory");
    expect(formatSubjectType("practical")).toBe("Practical");
  });
});
