"use client";

import { useCallback, useSyncExternalStore } from "react";

export type SubjectUpdateItem = {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  type: "video" | "pyq" | "notes" | "syllabus";
  title: string;
  timestamp: string;
  href: string;
  createdAt: number;
};

export const FEED_UPDATE_EVENT = "examnest:feed-update";

const EMPTY_FEED: readonly SubjectUpdateItem[] = Object.freeze([]);

let cachedRawFeed: string | null = null;
let cachedFeedItems: readonly SubjectUpdateItem[] = EMPTY_FEED;

/**
 * Format relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(timestampMs: number): string {
  const diffSec = Math.floor((Date.now() - timestampMs) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(timestampMs).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Reads real-time feed updates from localStorage with snapshot caching
 */
export function getRealtimeFeed(subjectIds: string[]): readonly SubjectUpdateItem[] {
  if (typeof window === "undefined" || !subjectIds || subjectIds.length === 0) {
    return EMPTY_FEED;
  }

  try {
    const raw = localStorage.getItem("examnest_realtime_feed");
    if (raw === cachedRawFeed) {
      return cachedFeedItems;
    }

    if (!raw) {
      cachedRawFeed = null;
      cachedFeedItems = EMPTY_FEED;
      return EMPTY_FEED;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      cachedRawFeed = raw;
      cachedFeedItems = EMPTY_FEED;
      return EMPTY_FEED;
    }

    // Filter to only updates belonging to the student's active subjects
    const relevant = parsed
      .filter((item: SubjectUpdateItem) => subjectIds.includes(item.subjectId))
      .sort((a: SubjectUpdateItem, b: SubjectUpdateItem) => b.createdAt - a.createdAt)
      .slice(0, 5);

    const frozen = Object.freeze(relevant);
    cachedRawFeed = raw;
    cachedFeedItems = frozen;
    return frozen;
  } catch {
    return EMPTY_FEED;
  }
}

/**
 * Subscribes to real-time feed broadcast events
 */
export function subscribeFeed(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(FEED_UPDATE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(FEED_UPDATE_EVENT, callback);
  };
}

/**
 * Pushes a generic real-time update for a subject (notes, video lecture, pyq, or syllabus).
 * Can be called whenever an upload or announcement occurs.
 */
export function pushSubjectUpdate(
  payload: Omit<SubjectUpdateItem, "id" | "createdAt" | "timestamp">
): SubjectUpdateItem {
  const now = Date.now();
  const newItem: SubjectUpdateItem = {
    ...payload,
    id: `upd-${now}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    timestamp: "Just now",
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("examnest_realtime_feed");
      const current: SubjectUpdateItem[] = raw ? JSON.parse(raw) : [];
      const updated = [newItem, ...current].slice(0, 20); // keep last 20
      localStorage.setItem("examnest_realtime_feed", JSON.stringify(updated));
    } catch {
      // ignore storage error
    }

    window.dispatchEvent(new Event(FEED_UPDATE_EVENT));
    window.dispatchEvent(new Event("storage"));
  }

  return newItem;
}

/**
 * React hook to reactively subscribe to generic real-time subject updates.
 */
export function useRealtimeSubjectUpdates(
  subjectIds: string[]
): readonly SubjectUpdateItem[] {
  const getSnapshot = useCallback(() => {
    return getRealtimeFeed(subjectIds);
  }, [subjectIds]);

  return useSyncExternalStore(
    subscribeFeed,
    getSnapshot,
    () => EMPTY_FEED
  );
}
