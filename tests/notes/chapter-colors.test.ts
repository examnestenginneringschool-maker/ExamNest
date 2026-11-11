import { describe, expect, it } from "vitest";
import {
  getChapterAccentPalette,
  getRelativeLuminance,
  getWhiteContrastRatio,
} from "@/lib/notes/chapter-colors";

describe("Dynamic Chapter Accent Color Generator", () => {
  it("generates 90 distinct, non-repeating card colors for 90 chapters", () => {
    const count = 90;
    const capColors = new Set<string>();
    const barColors = new Set<string>();
    const auraColors = new Set<string>();
    const clickColors = new Set<string>();

    for (let i = 0; i < count; i++) {
      const palette = getChapterAccentPalette(i, i + 1, "subject-physics-1");
      capColors.add(palette.capHex);
      barColors.add(palette.barHex);
      auraColors.add(palette.auraHex);
      clickColors.add(palette.clickBgHex);

      // Every top cap must meet WCAG AA white text contrast
      expect(getWhiteContrastRatio(palette.capHex)).toBeGreaterThanOrEqual(4.5);
      expect(palette.capHex).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.barHex).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.hoverBgHex).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.clickBgHex).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.capHex).not.toBe(palette.barHex);

      // Hover tint and click fill must stay light and soft (not dark or overly punchy)
      expect(getRelativeLuminance(palette.hoverBgHex)).toBeGreaterThan(0.88);
      expect(getRelativeLuminance(palette.clickBgHex)).toBeGreaterThan(0.75);
    }

    expect(capColors.size).toBe(count);
    expect(barColors.size).toBe(count);
    expect(auraColors.size).toBe(count);
    expect(clickColors.size).toBe(count);
  });

  it("is strictly deterministic across SSR/CSR calls", () => {
    const a = getChapterAccentPalette(4, 5, "f97043ad-cccb-4bdb-8c06-dd578a2c653d");
    const b = getChapterAccentPalette(4, 5, "f97043ad-cccb-4bdb-8c06-dd578a2c653d");
    expect(a).toEqual(b);
  });
});
