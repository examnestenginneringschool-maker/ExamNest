import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export interface StudentWatermarkInfo {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  subjectCode: string;
  subjectName: string;
  unitNumber: number;
  unitTitle: string;
  topicNumber: string;
  topicTitle: string;
}

export interface CompiledNoteItem {
  block_key?: string;
  block_type?: string;
  content?: Record<string, unknown>;
  sort_order?: number;
}

/**
 * Sanitizes text to WinAnsi-safe ASCII characters so StandardFonts in pdf-lib never throw encoding errors.
 */
function sanitizePdfText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/ħ/g, "h-bar")
    .replace(/∂/g, "d")
    .replace(/ψ/g, "psi")
    .replace(/Ĥ/g, "H")
    .replace(/ω/g, "omega")
    .replace(/θ/g, "theta")
    .replace(/π/g, "pi")
    .replace(/Δ/g, "Delta")
    .replace(/λ/g, "lambda")
    .replace(/μ/g, "mu")
    .replace(/σ/g, "sigma")
    .replace(/∈/g, "in")
    .replace(/≈/g, "~=")
    .replace(/≠/g, "!=")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/→/g, "->")
    .replace(/↔/g, "<->")
    .replace(/×/g, "x")
    .replace(/÷/g, "/")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/•/g, "*")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function wrapTextLines(
  text: string,
  maxCharsPerLine: number
): string[] {
  const clean = sanitizePdfText(text);
  const paragraphs = clean.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let currentLine = "";
    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
        currentLine += ` ${word}`;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Stamps a permanent, multi-layer Qoncepto + Student forensic watermark onto EVERY SINGLE PAGE
 * of an existing PDF document (`Uint8Array`).
 */
export async function stampWatermarkOnEveryPage(
  rawPdfBytes: Uint8Array,
  info: StudentWatermarkInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(rawPdfBytes, {
    ignoreEncryption: true,
  });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const safeName = sanitizePdfText(info.studentName || "Student").toUpperCase();
  const safeEmail = sanitizePdfText(info.studentEmail || "");
  const safePhone = sanitizePdfText(info.studentPhone || "");
  const shortId = sanitizePdfText(info.studentId.slice(0, 8).toUpperCase());
  const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

  const diagonalLine1 = `QONCEPTO  -  ${safeName}`;
  const diagonalLine2 = safePhone
    ? `${safeEmail}  |  ${safePhone}`
    : `${safeEmail}  |  ID: ${shortId}`;
  const diagonalLine3 = `LICENSED STUDY COPY  -  DO NOT SHARE OR DISTRIBUTE`;

  const headerText = sanitizePdfText(
    `QONCEPTO OFFICIAL NOTES   |   ${info.subjectCode}: ${info.subjectName}   |   Unit ${info.unitNumber} - Topic ${info.topicNumber}`
  );

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // 1. Top Header Bar Stamp on Every Page
    page.drawText(headerText.slice(0, 105), {
      x: 36,
      y: height - 20,
      size: 7.5,
      font: fontBold,
      color: rgb(0.36, 0.3, 1),
      opacity: 0.55,
    });

    // 2. Repeated Diagonal Watermark Grid (Top, Center, Bottom) on Every Page
    const verticalPositions = [height * 0.25, height * 0.52, height * 0.78];

    for (const yPos of verticalPositions) {
      page.drawText(diagonalLine1, {
        x: Math.max(48, width * 0.14),
        y: yPos,
        size: 21,
        font: fontBold,
        color: rgb(0.36, 0.3, 1),
        rotate: degrees(34),
        opacity: 0.11,
      });

      page.drawText(diagonalLine2, {
        x: Math.max(58, width * 0.16),
        y: yPos - 22,
        size: 11.5,
        font: fontBold,
        color: rgb(0.15, 0.18, 0.28),
        rotate: degrees(34),
        opacity: 0.12,
      });

      page.drawText(diagonalLine3, {
        x: Math.max(66, width * 0.18),
        y: yPos - 38,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.45, 0.12, 0.2),
        rotate: degrees(34),
        opacity: 0.12,
      });
    }

    // 3. Bottom Forensic Footer Stamp on Every Page
    const footerLeft = sanitizePdfText(
      `Licensed exclusively to: ${info.studentName} (${safeEmail}${safePhone ? " / " + safePhone : ""})  |  ${timestamp}`
    );
    const footerRight = `Page ${i + 1} of ${totalPages}  |  Qoncepto DRM Protected`;

    page.drawText(footerLeft.slice(0, 95), {
      x: 36,
      y: 16,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.3, 0.33, 0.42),
      opacity: 0.72,
    });

    page.drawText(footerRight, {
      x: Math.max(36, width - 175),
      y: 16,
      size: 7.5,
      font: fontBold,
      color: rgb(0.36, 0.3, 1),
      opacity: 0.72,
    });
  }

  // Embed forensic metadata in PDF document properties as well
  pdfDoc.setTitle(
    sanitizePdfText(`${info.subjectCode} - Topic ${info.topicNumber}: ${info.topicTitle}`)
  );
  pdfDoc.setAuthor("Qoncepto Academic Cell");
  pdfDoc.setSubject(
    sanitizePdfText(`Licensed to ${info.studentName} (${info.studentEmail})`)
  );
  pdfDoc.setKeywords([
    "Qoncepto",
    info.subjectCode,
    info.topicNumber,
    info.studentEmail,
    info.studentId,
  ]);
  pdfDoc.setProducer("Qoncepto Anti-Piracy PDF Engine");

  return pdfDoc.save();
}

/**
 * Generates a clean, multi-page academic PDF for a topic (from its syllabus + compiled notes)
 * and stamps the mandatory per-page student watermark on every single page.
 */
export async function generateWatermarkedTopicPdf(params: {
  watermarkInfo: StudentWatermarkInfo;
  topicSummary?: string | null;
  syllabusText?: string | null;
  importantTopics?: string[] | null;
  compiledNotes?: CompiledNoteItem[] | null;
}): Promise<Uint8Array> {
  const {
    watermarkInfo,
    topicSummary,
    syllabusText,
    importantTopics,
    compiledNotes,
  } = params;

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_WIDTH = 595.28; // A4 width
  const PAGE_HEIGHT = 841.89; // A4 height
  const MARGIN_X = 46;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

  let currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - 54;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY - neededHeight < 52) {
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - 54;
    }
  };

  // Top Banner Card on Page 1
  currentPage.drawRectangle({
    x: MARGIN_X,
    y: cursorY - 78,
    width: CONTENT_WIDTH,
    height: 78,
    color: rgb(0.96, 0.95, 1),
    borderColor: rgb(0.82, 0.8, 0.98),
    borderWidth: 1,
  });

  currentPage.drawText(
    sanitizePdfText(
      `${watermarkInfo.subjectCode}  ·  ${watermarkInfo.subjectName.toUpperCase()}  ·  UNIT ${watermarkInfo.unitNumber}`
    ).slice(0, 82),
    {
      x: MARGIN_X + 14,
      y: cursorY - 22,
      size: 9,
      font: fontBold,
      color: rgb(0.36, 0.3, 1),
    }
  );

  currentPage.drawText(
    sanitizePdfText(
      `Topic ${watermarkInfo.topicNumber}: ${watermarkInfo.topicTitle}`
    ).slice(0, 68),
    {
      x: MARGIN_X + 14,
      y: cursorY - 44,
      size: 15,
      font: fontBold,
      color: rgb(0.09, 0.11, 0.16),
    }
  );

  currentPage.drawText(
    sanitizePdfText(`Module: ${watermarkInfo.unitTitle}`).slice(0, 85),
    {
      x: MARGIN_X + 14,
      y: cursorY - 64,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.38, 0.41, 0.52),
    }
  );

  cursorY -= 98;

  // Topic Summary
  if (topicSummary) {
    const summaryLines = wrapTextLines(topicSummary, 86);
    ensureSpace(summaryLines.length * 14 + 24);

    currentPage.drawText("TOPIC OVERVIEW", {
      x: MARGIN_X,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: rgb(0.36, 0.3, 1),
    });
    cursorY -= 16;

    for (const line of summaryLines) {
      ensureSpace(15);
      currentPage.drawText(line, {
        x: MARGIN_X,
        y: cursorY,
        size: 10.5,
        font: fontOblique,
        color: rgb(0.22, 0.25, 0.34),
      });
      cursorY -= 14;
    }
    cursorY -= 10;
  }

  // Syllabus Coverage Box
  if (syllabusText) {
    const sylLines = wrapTextLines(syllabusText, 88);
    ensureSpace(sylLines.length * 13 + 28);

    currentPage.drawText("UNIVERSITY SYLLABUS COVERAGE", {
      x: MARGIN_X,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: rgb(0.28, 0.32, 0.44),
    });
    cursorY -= 15;

    for (const line of sylLines) {
      ensureSpace(14);
      currentPage.drawText(line, {
        x: MARGIN_X,
        y: cursorY,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.32, 0.36, 0.45),
      });
      cursorY -= 13;
    }
    cursorY -= 12;
  }

  // Divider line
  ensureSpace(16);
  currentPage.drawLine({
    start: { x: MARGIN_X, y: cursorY },
    end: { x: PAGE_WIDTH - MARGIN_X, y: cursorY },
    thickness: 0.8,
    color: rgb(0.88, 0.9, 0.94),
  });
  cursorY -= 20;

  // Render Compiled Notes Sections
  const items = Array.isArray(compiledNotes) ? compiledNotes : [];
  if (items.length > 0) {
    for (const block of items) {
      const content = (block.content || {}) as Record<string, unknown>;
      const title =
        typeof content.title === "string"
          ? content.title
          : typeof content.heading === "string"
          ? content.heading
          : null;
      const text =
        typeof content.text === "string"
          ? content.text
          : typeof content.body === "string"
          ? content.body
          : typeof content.definition === "string"
          ? content.definition
          : null;
      const formula =
        typeof content.formula === "string"
          ? content.formula
          : typeof content.equation === "string"
          ? content.equation
          : null;
      const description =
        typeof content.description === "string"
          ? content.description
          : typeof content.explanation === "string"
          ? content.explanation
          : null;
      const listItems = Array.isArray(content.items)
        ? (content.items as unknown[])
        : Array.isArray(content.points)
        ? (content.points as unknown[])
        : null;

      if (title) {
        ensureSpace(26);
        currentPage.drawText(sanitizePdfText(title).slice(0, 82), {
          x: MARGIN_X,
          y: cursorY,
          size: 11.5,
          font: fontBold,
          color: rgb(0.1, 0.12, 0.2),
        });
        cursorY -= 16;
      }

      if (text) {
        const textLines = wrapTextLines(text, 88);
        for (const line of textLines) {
          if (!line) {
            cursorY -= 6;
            continue;
          }
          ensureSpace(15);
          currentPage.drawText(line, {
            x: MARGIN_X,
            y: cursorY,
            size: 10,
            font: fontRegular,
            color: rgb(0.18, 0.2, 0.28),
          });
          cursorY -= 14;
        }
        cursorY -= 6;
      }

      if (formula) {
        const formulaLines = wrapTextLines(formula, 76);
        const boxHeight = formulaLines.length * 15 + 16;
        ensureSpace(boxHeight + 10);

        currentPage.drawRectangle({
          x: MARGIN_X + 8,
          y: cursorY - boxHeight + 6,
          width: CONTENT_WIDTH - 16,
          height: boxHeight,
          color: rgb(0.97, 0.97, 1),
          borderColor: rgb(0.78, 0.76, 0.98),
          borderWidth: 0.8,
        });

        let fy = cursorY - 10;
        for (const fl of formulaLines) {
          currentPage.drawText(fl, {
            x: MARGIN_X + 20,
            y: fy,
            size: 10.5,
            font: fontBold,
            color: rgb(0.24, 0.18, 0.75),
          });
          fy -= 15;
        }
        cursorY -= boxHeight + 8;
      }

      if (description) {
        const descLines = wrapTextLines(description, 86);
        for (const dl of descLines) {
          ensureSpace(14);
          currentPage.drawText(dl, {
            x: MARGIN_X + 8,
            y: cursorY,
            size: 9.5,
            font: fontOblique,
            color: rgb(0.32, 0.35, 0.45),
          });
          cursorY -= 13;
        }
        cursorY -= 6;
      }

      if (listItems && listItems.length > 0) {
        for (const item of listItems) {
          const itemStr =
            typeof item === "string"
              ? item
              : typeof item === "object" && item !== null
              ? JSON.stringify(item)
              : String(item);
          const bulletLines = wrapTextLines(`* ${itemStr}`, 84);
          for (const bl of bulletLines) {
            ensureSpace(14);
            currentPage.drawText(bl, {
              x: MARGIN_X + 10,
              y: cursorY,
              size: 10,
              font: fontRegular,
              color: rgb(0.18, 0.2, 0.28),
            });
            cursorY -= 13.5;
          }
        }
        cursorY -= 8;
      }
    }
  } else if (importantTopics && importantTopics.length > 0) {
    ensureSpace(30);
    currentPage.drawText("KEY EXAM FOCUS AREAS", {
      x: MARGIN_X,
      y: cursorY,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.12, 0.2),
    });
    cursorY -= 18;

    for (const focusItem of importantTopics) {
      ensureSpace(16);
      currentPage.drawText(sanitizePdfText(`* ${focusItem}`), {
        x: MARGIN_X + 10,
        y: cursorY,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.22, 0.3),
      });
      cursorY -= 15;
    }
  }

  const baseBytes = await pdfDoc.save();
  return stampWatermarkOnEveryPage(baseBytes, watermarkInfo);
}
