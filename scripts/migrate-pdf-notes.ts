/**
 * Migrates legacy unit notes & `subject_note_blocks` into topic-wise PDFs
 * stored inside the private `study-notes` bucket (`makaut/btech/sem-X/<subject>/unit-Y/topic-Z.pdf`).
 */
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  buildCanonicalR2NotePath,
  uploadToCloudflareR2,
} from "../src/lib/notes/r2-storage";

function sanitizeText(input: string | null | undefined): string {
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

function wrapLines(text: string, maxChars: number): string[] {
  const clean = sanitizeText(text);
  const paragraphs = clean.split(/\r?\n/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = "";
    for (const w of words) {
      if (!current) current = w;
      else if (current.length + 1 + w.length <= maxChars) current += ` ${w}`;
      else {
        lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

async function buildMasterTopicPdf(params: {
  subjectCode: string;
  subjectName: string;
  unitNumber: number;
  unitTitle: string;
  syllabusText: string | null;
  topicNumber: string;
  topicTitle: string;
  topicSummary: string | null;
  blocks: Array<{
    block_type?: string;
    content?: Record<string, unknown>;
  }>;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN_X = 46;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - 54;

  const ensureSpace = (h: number) => {
    if (y - h < 56) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - 54;
    }
  };

  // Header Banner
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 78,
    width: CONTENT_W,
    height: 78,
    color: rgb(0.96, 0.95, 1),
    borderColor: rgb(0.82, 0.8, 0.98),
    borderWidth: 1,
  });

  page.drawText(
    sanitizeText(
      `${params.subjectCode}  |  ${params.subjectName.toUpperCase()}  |  UNIT ${params.unitNumber}`
    ).slice(0, 82),
    {
      x: MARGIN_X + 14,
      y: y - 22,
      size: 9,
      font: fontBold,
      color: rgb(0.36, 0.3, 1),
    }
  );

  page.drawText(
    sanitizeText(`Topic ${params.topicNumber}: ${params.topicTitle}`).slice(
      0,
      68
    ),
    {
      x: MARGIN_X + 14,
      y: y - 44,
      size: 15,
      font: fontBold,
      color: rgb(0.09, 0.11, 0.16),
    }
  );

  page.drawText(
    sanitizeText(`Chapter: ${params.unitTitle}`).slice(0, 85),
    {
      x: MARGIN_X + 14,
      y: y - 64,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.38, 0.41, 0.52),
    }
  );

  y -= 98;

  if (params.topicSummary) {
    const sLines = wrapLines(params.topicSummary, 86);
    ensureSpace(sLines.length * 14 + 22);
    page.drawText("TOPIC SUMMARY", {
      x: MARGIN_X,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0.36, 0.3, 1),
    });
    y -= 15;
    for (const l of sLines) {
      ensureSpace(14);
      page.drawText(l, {
        x: MARGIN_X,
        y,
        size: 10.5,
        font: fontOblique,
        color: rgb(0.22, 0.25, 0.34),
      });
      y -= 14;
    }
    y -= 10;
  }

  for (const b of params.blocks) {
    const c = (b.content || {}) as Record<string, unknown>;
    const title =
      (typeof c.title === "string" && c.title) ||
      (typeof c.heading === "string" && c.heading) ||
      null;
    const text =
      (typeof c.text === "string" && c.text) ||
      (typeof c.body === "string" && c.body) ||
      (typeof c.definition === "string" && c.definition) ||
      null;
    const formula =
      (typeof c.formula === "string" && c.formula) ||
      (typeof c.equation === "string" && c.equation) ||
      null;
    const desc =
      (typeof c.description === "string" && c.description) ||
      (typeof c.exam_tip === "string" && `Exam Tip: ${c.exam_tip}`) ||
      null;
    const items = Array.isArray(c.items)
      ? c.items
      : Array.isArray(c.points)
      ? c.points
      : null;

    if (title) {
      ensureSpace(24);
      page.drawText(sanitizeText(title).slice(0, 82), {
        x: MARGIN_X,
        y,
        size: 11.5,
        font: fontBold,
        color: rgb(0.1, 0.12, 0.2),
      });
      y -= 16;
    }

    if (text) {
      const lines = wrapLines(text, 88);
      for (const l of lines) {
        if (!l) {
          y -= 6;
          continue;
        }
        ensureSpace(14);
        page.drawText(l, {
          x: MARGIN_X,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.18, 0.2, 0.28),
        });
        y -= 14;
      }
      y -= 6;
    }

    if (formula) {
      const fLines = wrapLines(formula, 76);
      const boxH = fLines.length * 15 + 16;
      ensureSpace(boxH + 10);
      page.drawRectangle({
        x: MARGIN_X + 8,
        y: y - boxH + 6,
        width: CONTENT_W - 16,
        height: boxH,
        color: rgb(0.97, 0.97, 1),
        borderColor: rgb(0.78, 0.76, 0.98),
        borderWidth: 0.8,
      });
      let fy = y - 10;
      for (const fl of fLines) {
        page.drawText(fl, {
          x: MARGIN_X + 20,
          y: fy,
          size: 10.5,
          font: fontBold,
          color: rgb(0.24, 0.18, 0.75),
        });
        fy -= 15;
      }
      y -= boxH + 8;
    }

    if (desc) {
      const dLines = wrapLines(desc, 86);
      for (const dl of dLines) {
        ensureSpace(14);
        page.drawText(dl, {
          x: MARGIN_X + 8,
          y,
          size: 9.5,
          font: fontOblique,
          color: rgb(0.25, 0.35, 0.28),
        });
        y -= 13;
      }
      y -= 6;
    }

    if (items && items.length > 0) {
      for (const it of items) {
        const str = typeof it === "string" ? it : JSON.stringify(it);
        const bLines = wrapLines(`* ${str}`, 84);
        for (const bl of bLines) {
          ensureSpace(14);
          page.drawText(bl, {
            x: MARGIN_X + 10,
            y,
            size: 10,
            font: fontRegular,
            color: rgb(0.18, 0.2, 0.28),
          });
          y -= 13.5;
        }
      }
      y -= 8;
    }
  }

  return pdfDoc.save();
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Fetch all subjects, units, topics, and blocks
  const [subjectsRes, unitsRes, topicsRes, blocksRes, currRes] =
    await Promise.all([
      supabase.from("subjects").select("id, code, name"),
      supabase
        .from("subject_note_units")
        .select(
          "id, subject_id, unit_number, title, syllabus_text, important_topics, notes"
        ),
      supabase
        .from("subject_note_topics")
        .select(
          "id, note_unit_id, topic_number, title, summary, is_important, sort_order"
        ),
      supabase
        .from("subject_note_blocks")
        .select("id, topic_id, block_key, block_type, content, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("curriculum_subjects")
        .select("subject_id, semester_number"),
    ]);

  const subjectsById = new Map(
    (subjectsRes.data || []).map((s) => [s.id, s])
  );
  const semBySubjectId = new Map(
    (currRes.data || []).map((c) => [c.subject_id, c.semester_number])
  );
  const units = unitsRes.data || [];
  let topics = topicsRes.data || [];
  const blocks = blocksRes.data || [];

  // 2. Convert any legacy `unit.notes` arrays (e.g. DSA) into proper `subject_note_topics` rows
  const topicsByUnit = new Map<string, typeof topics>();
  for (const t of topics) {
    const arr = topicsByUnit.get(t.note_unit_id) || [];
    arr.push(t);
    topicsByUnit.set(t.note_unit_id, arr);
  }

  let insertedLegacyTopics = 0;
  const legacyBlocksByTopicId = new Map<
    string,
    Array<{ block_type: string; content: Record<string, unknown> }>
  >();

  for (const unit of units) {
    const existingTopics = topicsByUnit.get(unit.id) || [];
    const legacyNotes = Array.isArray(unit.notes) ? unit.notes : [];

    if (existingTopics.length === 0 && legacyNotes.length > 0) {
      const toInsert = legacyNotes.map(
        (
          n: { heading?: string; body?: string; exam_tip?: string },
          idx: number
        ) => ({
          note_unit_id: unit.id,
          topic_number: `${unit.unit_number}.${idx + 1}`,
          title: n.heading || `Topic ${unit.unit_number}.${idx + 1}`,
          summary: n.exam_tip || null,
          is_important: Boolean(n.exam_tip),
          sort_order: idx + 1,
          is_active: true,
        })
      );

      const { data: insertedRows, error: insErr } = await supabase
        .from("subject_note_topics")
        .insert(toInsert)
        .select(
          "id, note_unit_id, topic_number, title, summary, is_important, sort_order"
        );

      if (!insErr && insertedRows) {
        insertedLegacyTopics += insertedRows.length;
        topics = [...topics, ...insertedRows];
        topicsByUnit.set(unit.id, insertedRows);

        insertedRows.forEach((row, idx) => {
          const rawNote = legacyNotes[idx] as {
            heading?: string;
            body?: string;
            exam_tip?: string;
          };
          legacyBlocksByTopicId.set(row.id, [
            {
              block_type: "paragraph",
              content: {
                title: rawNote.heading,
                text: rawNote.body,
                exam_tip: rawNote.exam_tip,
              },
            },
          ]);
        });
      }
    }
  }

  console.log(
    `Converted ${insertedLegacyTopics} legacy DSA unit notes into proper subject_note_topics rows.`
  );

  // 3. Group existing blocks by topic_id
  const blocksByTopic = new Map<
    string,
    Array<{ block_type?: string; content?: Record<string, unknown> }>
  >();
  for (const b of blocks) {
    const arr = blocksByTopic.get(b.topic_id) || [];
    arr.push({
      block_type: b.block_type,
      content: b.content as Record<string, unknown>,
    });
    blocksByTopic.set(b.topic_id, arr);
  }
  for (const [tId, lBlocks] of legacyBlocksByTopicId.entries()) {
    blocksByTopic.set(tId, lBlocks);
  }

  const unitsById = new Map(units.map((u) => [u.id, u]));

  // 4. Generate and upload master PDF for every topic into the private Cloudflare R2 `notes-bucket`
  let uploadedCount = 0;
  for (const topic of topics) {
    const unit = unitsById.get(topic.note_unit_id);
    if (!unit) continue;
    const subject = subjectsById.get(unit.subject_id);

    const storagePath = buildCanonicalR2NotePath({
      universityShortName: "makaut",
      subjectCode: subject?.code || "subject",
      unitNumber: unit.unit_number,
      unitTitle: unit.title,
      topicNumber: topic.topic_number,
      topicTitle: topic.title,
    });

    const pdfBytes = await buildMasterTopicPdf({
      subjectCode: subject?.code || "SUBJ",
      subjectName: subject?.name || "Subject",
      unitNumber: unit.unit_number,
      unitTitle: unit.title,
      syllabusText: unit.syllabus_text ?? null,
      topicNumber: topic.topic_number,
      topicTitle: topic.title,
      topicSummary: topic.summary ?? null,
      blocks: blocksByTopic.get(topic.id) || [],
    });

    const upRes = await uploadToCloudflareR2(
      storagePath,
      pdfBytes,
      "application/pdf",
      "notes-bucket"
    );

    if (upRes.success) {
      uploadedCount++;
    } else {
      console.error(`Failed upload for ${storagePath}:`, upRes.error);
    }
  }

  console.log(
    `Uploaded ${uploadedCount} topic-wise master PDFs into private Cloudflare R2 'notes-bucket'.`
  );
}

run().catch(console.error);
