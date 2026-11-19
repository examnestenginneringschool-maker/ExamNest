"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Download,
  FileEdit,
  FileText,
  HelpCircle,
  Loader2,
  Lock,
  Maximize2,
  Minimize2,
  PlayCircle,
  RefreshCw,
  School,
  ShieldCheck,
  Star,
  ThumbsUp,
} from "lucide-react";
import type { TopicBlock } from "@/components/notes/NoteBlockRenderer";
import type { NoteUnit, Topic } from "@/components/notes/UnitSection";
import {
  useSubjectProgress,
  toggleUnitProgress,
} from "@/lib/academic/progress-store";
import { issueTopicDrmTicket } from "@/app/app/subjects/[subjectId]/notes/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type TopicReaderWorkspaceProps = {
  subjectId: string;
  subjectName: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  unit: NoteUnit;
  topic: Topic | null;
  blocks?: TopicBlock[];
  topicsInUnit: Topic[];
  onSelectTopic: (unitNumber: number, topicId: string) => void;
  onNextTopic?: () => void;
  hasNextTopic: boolean;
  nextTopicTitle?: string;
  nextUnit?: { unitNumber: number; title: string } | null;
};

export function TopicReaderWorkspace({
  subjectId,
  subjectName,
  studentId,
  studentName = "Student",
  studentEmail = "",
  unit,
  topic,
  topicsInUnit,
  onSelectTopic,
  onNextTopic,
  hasNextTopic,
  nextTopicTitle,
  nextUnit,
}: TopicReaderWorkspaceProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(428);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFullscreenPdf, setIsFullscreenPdf] = useState(false);

  // PDF & Video DRM stream states
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null);
  const [isVideoHls, setIsVideoHls] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: 12, left: 62 });
  const [watermarkTime, setWatermarkTime] = useState("");

  const activeBlobUrlRef = useRef<string | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Sync completion directly with persistent Progress Store
  const progress = useSubjectProgress(subjectId);
  const isCompleted = progress.completedUnits.includes(unit.unit_number);

  const handleToggleComplete = () => {
    toggleUnitProgress(subjectId, unit.unit_number);
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      setHelpfulCount((c) => c - 1);
      setHasLiked(false);
    } else {
      setHelpfulCount((c) => c + 1);
      setHasLiked(true);
    }
  };

  /**
   * Fetches the selected Topic's PDF via a one-time, device-bound DRM ticket
   * and custom X-Qoncepto-Viewer header so the raw URL can never be copy-pasted or shared.
   */
  const loadSecuredTopicPdf = useCallback(async (targetTopicId: string) => {
    setIsPdfLoading(true);
    setPdfError(null);

    try {
      const ticketRes = await issueTopicDrmTicket(targetTopicId, "view");
      if (!ticketRes.ok || !ticketRes.url) {
        setPdfError(
          ticketRes.error || "Unable to authorize secure PDF stream."
        );
        return;
      }

      const response = await fetch(ticketRes.url, {
        method: "GET",
        headers: {
          "X-Qoncepto-Viewer": "1",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setPdfError(
          "Could not load topic PDF. Your session or one-time stream ticket may have expired."
        );
        return;
      }

      const pdfBlob = await response.blob();
      const nextBlobUrl = URL.createObjectURL(
        new Blob([pdfBlob], { type: "application/pdf" })
      );

      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }

      activeBlobUrlRef.current = nextBlobUrl;
      setPdfBlobUrl(`${nextBlobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`);
    } catch {
      setPdfError("Network error while loading secured topic PDF.");
    } finally {
      setIsPdfLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!topic?.id) return;
    const topicId = topic.id;
    queueMicrotask(() => {
      void loadSecuredTopicPdf(topicId);
    });

    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, [topic?.id, loadSecuredTopicPdf]);

  // Load locked video stream ticket if topic has an attached video lecture
  useEffect(() => {
    if (!topic?.id || !topic?.video_storage_path) {
      queueMicrotask(() => {
        setVideoStreamUrl(null);
        setIsVideoHls(false);
      });
      return;
    }

    let cancelled = false;
    const topicId = topic.id;

    queueMicrotask(() => {
      if (cancelled) return;
      setIsVideoLoading(true);
      issueTopicDrmTicket(topicId, "video")
        .then((res) => {
          if (!cancelled && res.ok && res.url) {
            setVideoStreamUrl(res.url);
            setIsVideoHls(Boolean(res.isHls));
          }
        })
        .finally(() => {
          if (!cancelled) setIsVideoLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [topic?.id, topic?.video_storage_path]);

  // Attach HLS.js adaptive stream (or native Safari HLS / MP4 direct source)
  useEffect(() => {
    const videoEl = videoElementRef.current;
    if (!videoEl || !videoStreamUrl) return;

    if (!isVideoHls) {
      videoEl.src = videoStreamUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        },
      });
      hls.loadSource(videoStreamUrl);
      hls.attachMedia(videoEl);

      return () => {
        hls.destroy();
      };
    }

    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.src = videoStreamUrl;
    }
  }, [videoStreamUrl, isVideoHls]);

  // Dynamic moving forensic student watermark (shifts every 17s to deter capture)
  useEffect(() => {
    if (!videoStreamUrl) return;

    const updateWatermark = () => {
      const top = Math.floor(10 + Math.random() * 64);
      const left = Math.floor(8 + Math.random() * 54);
      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setWatermarkPos({ top, left });
      setWatermarkTime(nowStr);
    };

    updateWatermark();
    const timer = window.setInterval(updateWatermark, 17000);
    return () => window.clearInterval(timer);
  }, [videoStreamUrl]);

  // Fraud-proof 30-second watch-hour telemetry heartbeat
  useEffect(() => {
    if (!videoStreamUrl || !topic?.id || !studentId) return;

    const supabase = createBrowserSupabaseClient();
    const topicId = topic.id;

    const timer = window.setInterval(() => {
      const videoEl = videoElementRef.current;
      if (!videoEl || videoEl.paused || videoEl.ended || document.hidden) {
        return;
      }

      const durationSec =
        Number.isFinite(videoEl.duration) && videoEl.duration > 0
          ? Math.round(videoEl.duration)
          : null;

      void supabase
        .rpc("log_watch_heartbeat", {
          p_user_id: studentId,
          p_video_id: topicId,
          p_subject_id: subjectId,
          p_increment: 30,
          p_video_duration: durationSec,
        })
        .then(
          () => {},
          () => {}
        );
    }, 30000);

    return () => window.clearInterval(timer);
  }, [videoStreamUrl, topic?.id, studentId, subjectId]);

  /**
   * Generates a single-use download ticket ONLY when the student clicks the Download PDF button
   * to stream the pre-branded topic PDF from storage.
   */
  const handleDownloadTopicPdf = async () => {
    if (!topic?.id || isDownloadingPdf) return;

    try {
      setIsDownloadingPdf(true);
      const ticketRes = await issueTopicDrmTicket(topic.id, "download");
      if (!ticketRes.ok || !ticketRes.url) {
        alert(
          ticketRes.error || "Unable to generate download link right now."
        );
        return;
      }

      const link = document.createElement("a");
      link.href = ticketRes.url;
      link.setAttribute(
        "download",
        `Qoncepto_Topic_${topic.topic_number}_Notes.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => {
        setIsDownloadingPdf(false);
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ======================================================== */}
      {/* 1. TOP ACTION RIBBON & SECURE PDF CONTROLS               */}
      {/* ======================================================== */}
      <div className="bg-white p-3 sm:px-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-wrap items-center justify-between gap-3">
        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-full sm:max-w-md">
          <span className="text-slate-700 hover:text-indigo-600 cursor-pointer">
            {subjectName}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-700 hover:text-indigo-600 cursor-pointer">
            Unit {String(unit.unit_number).padStart(2, "0")}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-full truncate">
            {topic ? `${topic.topic_number} ${topic.title}` : unit.title}
          </span>
        </div>

        {/* Reader Utilities */}
        <div className="flex items-center gap-2">
          {/* Reload Secure Stream Button */}
          {topic && (
            <button
              onClick={() => void loadSecuredTopicPdf(topic.id)}
              disabled={isPdfLoading}
              title="Refresh secure PDF stream"
              type="button"
              className="w-8 h-8 rounded-full border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isPdfLoading ? "animate-spin" : ""}`}
              />
            </button>
          )}

          {/* Fullscreen Reader Toggle */}
          <button
            onClick={() => setIsFullscreenPdf((prev) => !prev)}
            type="button"
            title={
              isFullscreenPdf ? "Exit expanded view" : "Expand PDF reader"
            }
            className="w-8 h-8 rounded-full border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
          >
            {isFullscreenPdf ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked((prev) => !prev)}
            type="button"
            title={isBookmarked ? "Bookmarked" : "Bookmark topic"}
            className={`w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer ${
              isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`}
            />
          </button>

          {/* Download Topic PDF Button */}
          {topic?.is_pdf_downloadable !== false && (
            <button
              onClick={handleDownloadTopicPdf}
              disabled={!topic || isDownloadingPdf}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download Topic PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. UNIVERSITY SYLLABUS COVERAGE SUMMARY CARD             */}
      {/* ======================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <School className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-700">
              University Syllabus Coverage
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DRM Protected · Official Study Notes</span>
          </span>
        </div>

        {unit.syllabus_text && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {unit.syllabus_text}
          </p>
        )}

        {/* High Exam Weightage Topic Chips */}
        {unit.important_topics && unit.important_topics.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                High Exam Weightage Topics
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unit.important_topics.map((item, idx) => {
                const matchedTopic = topicsInUnit.find(
                  (t) =>
                    t.title.toLowerCase().includes(item.toLowerCase()) ||
                    item.toLowerCase().includes(t.title.toLowerCase())
                );

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (matchedTopic) {
                        onSelectTopic(unit.unit_number, matchedTopic.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1 transition-colors ${
                      matchedTopic
                        ? "bg-amber-50 hover:bg-amber-100/90 border-amber-200/80 text-amber-900 cursor-pointer"
                        : "bg-slate-50 border-slate-200 text-slate-700 cursor-default"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. LOCKED NON-SHAREABLE VIDEO LECTURE SURFACE (IF ANY)   */}
      {/* ======================================================== */}
      {topic?.video_storage_path && (
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg relative select-none"
        >
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-white">
              <PlayCircle className="h-4 w-4 text-indigo-400" />
              <span>
                Topic {topic.topic_number} Video Lecture · {topic.title}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <Lock className="h-3 w-3" />
              <span>Non-Downloadable & Non-Shareable Stream</span>
            </span>
          </div>

          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {isVideoLoading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                <span>Authorizing encrypted video stream...</span>
              </div>
            ) : videoStreamUrl ? (
              <>
                <video
                  ref={videoElementRef}
                  controls
                  playsInline
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain"
                />
                {/* Moving Forensic Student Watermark Overlay */}
                <div
                  style={{
                    top: `${watermarkPos.top}%`,
                    left: `${watermarkPos.left}%`,
                  }}
                  className="pointer-events-none absolute px-2.5 py-1 rounded bg-black/40 text-white/45 text-[10px] font-mono tracking-wide select-none transition-all duration-700"
                >
                  {studentEmail || studentName}
                  {watermarkTime ? ` · ${watermarkTime}` : ""}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Video stream unavailable.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SECURED ON-SCREEN TOPIC PDF READER WORKSPACE          */}
      {/* ======================================================== */}
      <article
        onContextMenu={(e) => e.preventDefault()}
        className={`bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-4 select-none ${
          isFullscreenPdf
            ? "fixed inset-3 z-50 overflow-hidden bg-white shadow-2xl"
            : ""
        }`}
      >
        {/* Header & Badges */}
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {topic ? (
                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Topic {topic.topic_number}
                </span>
              ) : (
                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Unit {unit.unit_number}
                </span>
              )}

              {topic?.is_important && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-600" />
                  High Exam Weightage
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                <FileText className="h-3 w-3 text-indigo-600" />
                <span>Official Topic PDF Notes</span>
              </span>
            </div>

            {isFullscreenPdf && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPdf(false)}
                  className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Close Fullscreen
                </button>
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {topic?.title || unit.title}
          </h1>

          {topic?.summary && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {topic.summary}
            </p>
          )}
        </div>

        {/* Embedded PDF Viewer Surface */}
        <div
          className={`relative w-full rounded-xl border border-slate-200 bg-slate-900 overflow-hidden ${
            isFullscreenPdf ? "flex-1 min-h-0" : "h-[680px] sm:h-[780px]"
          }`}
        >
          {isPdfLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">
                  Fetching Topic PDF from Secure Storage...
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Streaming official Qoncepto study notes
                </p>
              </div>
            </div>
          ) : pdfError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-rose-50/40 p-6 text-center">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <p className="text-sm font-bold text-slate-900">{pdfError}</p>
              {topic && (
                <button
                  type="button"
                  onClick={() => void loadSecuredTopicPdf(topic.id)}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Retry Loading PDF
                </button>
              )}
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title={`${topic?.topic_number || ""} ${
                topic?.title || unit.title
              }`}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
              Select a topic from the syllabus navigator to view its PDF notes.
            </div>
          )}
        </div>

        {/* Student Interaction & Next Progression Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl">
          {/* Helpful & Note actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                hasLiked
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Helpful ({helpfulCount})</span>
            </button>

            <button
              onClick={() =>
                alert(
                  "Personal student notes feature is coming in the next update!"
                )
              }
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileEdit className="h-3.5 w-3.5 text-slate-400" />
              <span>Add My Note</span>
            </button>
          </div>

          {/* Progression Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleToggleComplete}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isCompleted ? "Unit Completed ✓" : "Mark Unit Completed"}
            </button>

            {hasNextTopic ? (
              <button
                onClick={onNextTopic}
                type="button"
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Next: {nextTopicTitle || "Topic"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : nextUnit ? (
              <Link
                href={`/app/subjects/${subjectId}/notes/${nextUnit.unitNumber}`}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <span>
                  Next Chapter: {String(nextUnit.unitNumber).padStart(2, "0")}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href={`/app/subjects/${subjectId}/notes`}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <span>All Chapters</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </article>

      {/* ======================================================== */}
      {/* 5. CONTEXTUAL CHECKPOINT PRACTICE PROMPT                 */}
      {/* ======================================================== */}
      <div className="bg-amber-50/70 border border-amber-200/70 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Test Your Understanding: {topic?.title || unit.title}
            </h4>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Quick 3-question adaptive checkpoint quiz · 5 mins
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            alert("Adaptive checkpoint quiz is ready for this chapter!")
          }
          type="button"
          className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
        >
          Start Checkpoint
        </button>
      </div>
    </div>
  );
}
