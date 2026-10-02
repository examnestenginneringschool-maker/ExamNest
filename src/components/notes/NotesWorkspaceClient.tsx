"use client";

import { useState, useMemo, useEffect } from "react";
import { SyllabusNavigator, type NavigatorUnit } from "./SyllabusNavigator";
import { TopicReaderWorkspace } from "./TopicReaderWorkspace";
import { FloatingNavMenu } from "./FloatingNavMenu";
import type { NoteUnit, Topic } from "./UnitSection";
import type { TopicBlock } from "./NoteBlockRenderer";

type NotesWorkspaceClientProps = {
  subjectId: string;
  subjectName: string;
  semesterNumber: number;
  units: NoteUnit[];
  topicsByUnit: Record<string, Topic[]>;
  blocksByTopic: Record<string, TopicBlock[]>;
};

export function NotesWorkspaceClient({
  subjectId,
  subjectName,
  semesterNumber,
  units,
  topicsByUnit,
  blocksByTopic,
}: NotesWorkspaceClientProps) {
  // Navigator formatted units
  const navigatorUnits: NavigatorUnit[] = useMemo(() => {
    return units.map((unit) => ({
      id: unit.id,
      unit_number: unit.unit_number,
      title: unit.title,
      topics: (topicsByUnit[unit.id] ?? []).map((t) => ({
        id: t.id,
        topic_number: t.topic_number,
        title: t.title,
        is_important: t.is_important,
      })),
    }));
  }, [units, topicsByUnit]);

  // Active state: active unit number and active topic ID
  const [activeUnitNumber, setActiveUnitNumber] = useState<number>(() => {
    return units[0]?.unit_number ?? 1;
  });

  const activeUnit = useMemo(() => {
    return units.find((u) => u.unit_number === activeUnitNumber) ?? units[0];
  }, [units, activeUnitNumber]);

  const topicsInActiveUnit = useMemo(() => {
    return activeUnit ? topicsByUnit[activeUnit.id] ?? [] : [];
  }, [activeUnit, topicsByUnit]);

  const [activeTopicId, setActiveTopicId] = useState<string | null>(() => {
    const firstUnitTopics = units[0] ? topicsByUnit[units[0].id] ?? [] : [];
    return firstUnitTopics[0]?.id ?? null;
  });

  const activeTopic = useMemo(() => {
    if (!activeTopicId) return topicsInActiveUnit[0] ?? null;
    return topicsInActiveUnit.find((t) => t.id === activeTopicId) ?? topicsInActiveUnit[0] ?? null;
  }, [activeTopicId, topicsInActiveUnit]);

  // Record subject-specific active session to allow resuming later without cross-subject overlap
  useEffect(() => {
    if (typeof window === "undefined" || !activeUnit) return;
    try {
      localStorage.setItem(
        `examnest_resume_${subjectId}`,
        JSON.stringify({
          subjectId,
          unitNumber: activeUnit.unit_number,
          unitTitle: activeUnit.title,
          topicTitle: activeTopic?.title,
          timestamp: Date.now(),
          completed: false,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [subjectId, activeUnit, activeTopic]);

  // Topic blocks
  const currentBlocks = useMemo(() => {
    if (!activeTopic) return [];
    return blocksByTopic[activeTopic.id] ?? [];
  }, [activeTopic, blocksByTopic]);

  // Next topic resolution
  const currentTopicIndex = useMemo(() => {
    if (!activeTopic) return -1;
    return topicsInActiveUnit.findIndex((t) => t.id === activeTopic.id);
  }, [activeTopic, topicsInActiveUnit]);

  const hasNextTopic = currentTopicIndex >= 0 && currentTopicIndex < topicsInActiveUnit.length - 1;
  const nextTopic = hasNextTopic ? topicsInActiveUnit[currentTopicIndex + 1] : null;

  const handleSelectTopic = (unitNumber: number, topicId: string) => {
    setActiveUnitNumber(unitNumber);
    setActiveTopicId(topicId);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextTopic = () => {
    if (nextTopic) {
      setActiveTopicId(nextTopic.id);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* 1. Floating Popover Edge Switch Menu */}
      <FloatingNavMenu subjectId={subjectId} />

      {/* 2. Main Two-Column Workspace Layout (matching Google Stitch Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
        {/* Left Column: Syllabus & Course Navigator (4 cols on lg ~ 340-380px) */}
        <div className="lg:col-span-4 xl:col-span-4 sticky top-24 self-start">
          <SyllabusNavigator
            subjectName={subjectName}
            semesterNumber={semesterNumber}
            units={navigatorUnits}
            activeUnitNumber={activeUnitNumber}
            activeTopicId={activeTopic?.id ?? null}
            onSelectTopic={handleSelectTopic}
          />
        </div>

        {/* Right Column: Study Workspace & Reader Surface (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col min-w-0">
          {activeUnit ? (
            <TopicReaderWorkspace
              subjectId={subjectId}
              subjectName={subjectName}
              unit={activeUnit}
              topic={activeTopic}
              blocks={currentBlocks}
              topicsInUnit={topicsInActiveUnit}
              onSelectTopic={handleSelectTopic}
              onNextTopic={handleNextTopic}
              hasNextTopic={hasNextTopic}
              nextTopicTitle={nextTopic ? `${nextTopic.topic_number} ${nextTopic.title}` : undefined}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              No units currently available for this subject.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
