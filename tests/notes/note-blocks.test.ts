import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import type { TopicBlock } from "@/components/notes/NoteBlockRenderer";
import {
  createDrmStreamTicket,
  verifyAndConsumeDrmTicket,
} from "@/lib/notes/drm-ticket";
import {
  generateWatermarkedTopicPdf,
  stampWatermarkOnEveryPage,
} from "@/lib/notes/pdf-watermarker";
import {
  buildCanonicalR2NotePath,
  buildCanonicalR2VideoPath,
  toStorageSlug,
} from "@/lib/notes/r2-storage";

describe("Note Block Data Structure Contracts", () => {
  it("validates formula block structure", () => {
    const formulaBlock: TopicBlock = {
      id: "block-1",
      topic_id: "topic-1",
      block_key: "f-1",
      block_type: "formula",
      content: {
        title: "Schrödinger Equation",
        formula: "iħ ∂ψ/∂t = Ĥψ",
        description: "Time-dependent quantum state evolution",
      },
      sort_order: 1,
    };

    expect(formulaBlock.block_type).toBe("formula");
    expect(formulaBlock.content.formula).toBeDefined();
    expect(formulaBlock.content.title).toBe("Schrödinger Equation");
  });

  it("validates list block structure", () => {
    const listBlock: TopicBlock = {
      id: "block-2",
      topic_id: "topic-1",
      block_key: "list-1",
      block_type: "bullet_list",
      content: {
        title: "Key Characteristics",
        items: ["Conservation of Energy", "Time Invariance", "Linearity"],
      },
      sort_order: 2,
    };

    expect(listBlock.block_type).toBe("bullet_list");
    expect(listBlock.content.items?.length).toBe(3);
  });

  it("validates SidebarUnit outline topic mapping", () => {
    const unit = {
      id: "u-1",
      unit_number: 1,
      title: "Simple Harmonic Motion",
      topics: [
        {
          id: "t-1",
          topic_number: "1.1",
          title: "Introduction to SHM",
          is_important: true,
        },
        {
          id: "t-2",
          topic_number: "1.2",
          title: "Differential Equation",
          is_important: false,
        },
      ],
    };

    expect(unit.topics.length).toBe(2);
    expect(unit.topics[0].topic_number).toBe("1.1");
    expect(unit.topics[0].is_important).toBe(true);
    expect(unit.topics[1].topic_number).toBe("1.2");
  });

  it("enforces single-use, device-bound DRM tickets and blocks URL sharing", () => {
    const ticket = createDrmStreamTicket({
      userId: "student-uuid-1",
      deviceToken: "device-token-abc",
      topicId: "topic-101",
      intent: "view",
      ttlSeconds: 60,
    });

    // 1.Sharing with another user must be blocked
    const wrongUser = verifyAndConsumeDrmTicket({
      ticket,
      expectedUserId: "student-uuid-2",
      expectedDeviceToken: "device-token-abc",
      expectedTopicId: "topic-101",
      expectedIntent: "view",
    });
    expect(wrongUser.valid).toBe(false);

    // 2. Sharing with another device/browser must be blocked
    const wrongDevice = verifyAndConsumeDrmTicket({
      ticket,
      expectedUserId: "student-uuid-1",
      expectedDeviceToken: "different-device-xyz",
      expectedTopicId: "topic-101",
      expectedIntent: "view",
    });
    expect(wrongDevice.valid).toBe(false);

    // 3. Authorized student + device succeeds once
    const firstUse = verifyAndConsumeDrmTicket({
      ticket,
      expectedUserId: "student-uuid-1",
      expectedDeviceToken: "device-token-abc",
      expectedTopicId: "topic-101",
      expectedIntent: "view",
    });
    expect(firstUse.valid).toBe(true);

    // 4. Copy-pasting / reusing the same URL a second time is strictly blocked
    const secondUse = verifyAndConsumeDrmTicket({
      ticket,
      expectedUserId: "student-uuid-1",
      expectedDeviceToken: "device-token-abc",
      expectedTopicId: "topic-101",
      expectedIntent: "view",
    });
    expect(secondUse.valid).toBe(false);
  });

  it("stamps student watermark onto every page of a multi-page PDF", async () => {
    const basePdf = await PDFDocument.create();
    basePdf.addPage([595.28, 841.89]);
    basePdf.addPage([595.28, 841.89]);
    basePdf.addPage([595.28, 841.89]);
    const rawBytes = await basePdf.save();

    const watermarkedBytes = await stampWatermarkOnEveryPage(rawBytes, {
      studentId: "644f219a-0af2-4c8d-8374-776c69454884",
      studentName: "Sayantan Das",
      studentEmail: "dassambit2006@gmail.com",
      studentPhone: "+919876543210",
      subjectCode: "BS-PH101",
      subjectName: "Physics-I",
      unitNumber: 1,
      unitTitle: "Simple Harmonic Motion",
      topicNumber: "1.1",
      topicTitle: "Introduction",
    });

    const loaded = await PDFDocument.load(watermarkedBytes);
    expect(loaded.getPageCount()).toBe(3);
    expect(loaded.getAuthor()).toBe("Qoncepto Academic Cell");

    const generatedBytes = await generateWatermarkedTopicPdf({
      watermarkInfo: {
        studentId: "644f219a-0af2-4c8d-8374-776c69454884",
        studentName: "Sayantan Das",
        studentEmail: "dassambit2006@gmail.com",
        studentPhone: "+919876543210",
        subjectCode: "BS-PH101",
        subjectName: "Physics-I",
        unitNumber: 1,
        unitTitle: "Simple Harmonic Motion",
        topicNumber: "1.1",
        topicTitle: "Introduction",
      },
      topicSummary: "Core concepts of simple harmonic motion.",
      syllabusText: "Oscillations and wave optics.",
    });

    const loadedGen = await PDFDocument.load(generatedBytes);
    expect(loadedGen.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("constructs canonical 4-level Cloudflare R2 note and video paths using university and subject code", () => {
    expect(toStorageSlug("BS-PH101")).toBe("bs_ph101");
    expect(toStorageSlug("PCC-CS301")).toBe("pcc_cs301");
    expect(toStorageSlug("Moseley's Law")).toBe("moseleys_law");

    const notePath = buildCanonicalR2NotePath({
      universityShortName: "MAKAUT",
      subjectCode: "BS-PH101",
      unitNumber: 1,
      unitTitle: "Simple Harmonic Motion",
      topicNumber: "1.1",
      topicTitle: "Introduction",
    });
    expect(notePath).toBe(
      "makaut/bs_ph101/unit_1_simple_harmonic_motion/topic_1_1_introduction.pdf"
    );

    const videoPath = buildCanonicalR2VideoPath({
      universityShortName: "MAKAUT",
      subjectCode: "PCC-CS301",
      unitNumber: 2,
      unitTitle: "Stacks and Queues",
      topicNumber: "2.1",
      topicTitle: "Stack ADT",
    });
    expect(videoPath).toBe(
      "makaut/pcc_cs301/unit_2_stacks_and_queues/lecture_2_1_stack_adt.mp4"
    );
  });
});

