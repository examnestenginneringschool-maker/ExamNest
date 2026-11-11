export type ChapterColorPalette = {
  /** Deeper top header cap of the right-hand vertical bar (WCAG AA contrast with white text) */
  capHex: string;
  /** Companion lower body of the right-hand vertical bar */
  barHex: string;
  /** Lightest ethereal surface wash applied gently on hover */
  hoverBgHex: string;
  /** Soft border accent on hover matching the card's color bar */
  hoverBorderHex: string;
  /** Soft luminous aura hue glowing behind the card on hover */
  auraHex: string;
  /** Space-separated RGB triple ("r g b") for soft CSS box-shadow glow */
  glowRgb: string;
  /** Calm, light wash background on click/press (never dark or overly punchy) */
  clickBgHex: string;
  /** Coordinated border during click/press */
  clickBorderHex: string;
};

/**
 * Deterministic 32-bit FNV-1a hash so colors remain identical between SSR and CSR.
 */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Low-discrepancy fractional sequence using golden ratio conjugate (~0.61803398875).
 */
function haltonGolden(index: number, seedOffset = 0): number {
  const val = seedOffset + index * 0.6180339887498949;
  return val - Math.floor(val);
}

/**
 * Converts perceptual OKLCH coordinates to gamut-mapped Linear sRGB [0..1].
 */
function oklchToLinearSrgb(
  l: number,
  c: number,
  hDeg: number
): [number, number, number] {
  const hRad = (hDeg * Math.PI) / 180;
  const cosH = Math.cos(hRad);
  const sinH = Math.sin(hRad);

  const toLinear = (chroma: number): [number, number, number] => {
    const a = chroma * cosH;
    const b = chroma * sinH;

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    return [
      +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
      -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
      -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
    ];
  };

  let rgb = toLinear(c);
  if (
    rgb[0] >= 0 &&
    rgb[0] <= 1 &&
    rgb[1] >= 0 &&
    rgb[1] <= 1 &&
    rgb[2] >= 0 &&
    rgb[2] <= 1
  ) {
    return rgb;
  }

  // Binary search chroma inward so hue and perceptual lightness stay intact inside sRGB
  let low = 0;
  let high = c;
  for (let iter = 0; iter < 12; iter++) {
    const mid = (low + high) / 2;
    const candidate = toLinear(mid);
    if (
      candidate[0] >= 0 &&
      candidate[0] <= 1 &&
      candidate[1] >= 0 &&
      candidate[1] <= 1 &&
      candidate[2] >= 0 &&
      candidate[2] <= 1
    ) {
      low = mid;
      rgb = candidate;
    } else {
      high = mid;
    }
  }

  return [
    Math.min(1, Math.max(0, rgb[0])),
    Math.min(1, Math.max(0, rgb[1])),
    Math.min(1, Math.max(0, rgb[2])),
  ];
}

function linearChannelToSrgbByte(linear: number): number {
  const clamped = Math.min(1, Math.max(0, linear));
  const encoded =
    clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, encoded * 255)));
}

function linearSrgbToHex([rLin, gLin, bLin]: [number, number, number]): string {
  const r = linearChannelToSrgbByte(rLin).toString(16).padStart(2, "0");
  const g = linearChannelToSrgbByte(gLin).toString(16).padStart(2, "0");
  const b = linearChannelToSrgbByte(bLin).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function oklchToRgbTriple(l: number, c: number, hDeg: number): string {
  const [rLin, gLin, bLin] = oklchToLinearSrgb(l, c, hDeg);
  return `${linearChannelToSrgbByte(rLin)} ${linearChannelToSrgbByte(gLin)} ${linearChannelToSrgbByte(bLin)}`;
}

/**
 * WCAG 2.1 relative luminance for a `#RRGGBB` hex string.
 */
export function getRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const rS = parseInt(clean.slice(0, 2), 16) / 255;
  const gS = parseInt(clean.slice(2, 4), 16) / 255;
  const bS = parseInt(clean.slice(4, 6), 16) / 255;

  const toLin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLin(rS) + 0.7152 * toLin(gS) + 0.0722 * toLin(bS);
}

/**
 * WCAG contrast ratio against pure white (`#ffffff`).
 */
export function getWhiteContrastRatio(hex: string): number {
  const lum = getRelativeLuminance(hex);
  return 1.05 / (lum + 0.05);
}

function oklchToHex(l: number, c: number, hDeg: number): string {
  return linearSrgbToHex(oklchToLinearSrgb(l, c, hDeg));
}

/**
 * Generates an unlimited, non-repeating sequence of refined, educational-grade
 * two-tone color bars plus coordinated light hover aura & soft click tones
 * for any number of chapters (4, 10, 90, or more).
 */
export function getChapterAccentPalette(
  chapterIndex: number,
  unitNumber: number,
  subjectKey = ""
): ChapterColorPalette {
  const subjectHash = hashString(subjectKey || "examnest");
  const baseHue = (subjectHash % 360) + (unitNumber % 3) * 0.37;

  // Golden Angle distribution in degrees: never aligns or cycles over finite N
  const GOLDEN_ANGLE = 137.50776405003785;
  const hue = (baseHue + chapterIndex * GOLDEN_ANGLE) % 360;

  // Quasi-random restrained academic chroma
  const tChroma = haltonGolden(chapterIndex, (subjectHash % 97) / 97);
  const tLight = haltonGolden(
    chapterIndex * 3 + unitNumber,
    ((subjectHash >> 8) % 89) / 89
  );

  const isYellowGreenBand = hue >= 85 && hue <= 140;
  const minChroma = isYellowGreenBand ? 0.068 : 0.075;
  const maxChroma = isYellowGreenBand ? 0.118 : 0.138;
  const chroma = minChroma + tChroma * (maxChroma - minChroma);

  // Deeper top header cap (>= 4.6:1 contrast against white chapter number)
  let capL = 0.455 + (tLight - 0.5) * 0.055;
  let capHex = oklchToHex(capL, chroma, hue);

  while (getWhiteContrastRatio(capHex) < 4.6 && capL > 0.25) {
    capL -= 0.02;
    capHex = oklchToHex(capL, chroma, hue);
  }

  // Companion lower bar
  const barL = Math.min(0.62, capL + 0.105);
  const barChroma = Math.min(0.15, chroma + 0.014);
  const barHue = (hue + 2.5) % 360;
  const barHex = oklchToHex(barL, barChroma, barHue);

  // Hover: lightest ethereal tint of the color bar + luminous backside aura
  const hoverBgHex = oklchToHex(0.976, Math.min(0.022, chroma * 0.2), barHue);
  const hoverBorderHex = oklchToHex(0.84, Math.min(0.075, chroma * 0.62), barHue);
  const auraHex = oklchToHex(0.855, Math.min(0.105, chroma * 0.85), barHue);
  const glowRgb = oklchToRgbTriple(0.7, Math.min(0.135, chroma * 1.05), barHue);

  // Click / Active: soft, calm, light tone of this card's exact color (never dark or punchy)
  const clickBgHex = oklchToHex(0.928, Math.min(0.052, chroma * 0.45), barHue);
  const clickBorderHex = oklchToHex(0.755, Math.min(0.09, chroma * 0.72), barHue);

  return {
    capHex,
    barHex,
    hoverBgHex,
    hoverBorderHex,
    auraHex,
    glowRgb,
    clickBgHex,
    clickBorderHex,
  };
}
