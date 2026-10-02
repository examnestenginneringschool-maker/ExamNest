import { describe, expect, it } from "vitest";
import type { TopicBlock } from "@/components/notes/NoteBlockRenderer";

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
});

