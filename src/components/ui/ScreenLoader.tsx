"use client";

import { useEffect, useState } from "react";

export type LoaderVariant = "dashboard" | "subject" | "notes" | "onboarding" | "default";

interface VariantConfig {
  svgPath: string;
  alt: string;
  messages: string[];
  containerSize: string;
}

const CONFIGS: Record<LoaderVariant, VariantConfig> = {
  dashboard: {
    svgPath: "/loaders/dashboard.svg",
    alt: "Loading your dashboard",
    messages: [
      "Loading your dashboard...",
      "Syncing semester subjects...",
      "Updating study progress...",
      "Preparing today's focus...",
    ],
    containerSize: "w-[320px] sm:w-[420px] md:w-[470px] aspect-[1625/990]",
  },
  subject: {
    svgPath: "/loaders/subject.svg",
    alt: "Loading subject syllabus",
    messages: [
      "Opening subject syllabus...",
      "Loading verified units & proofs...",
      "Organizing chapter archives...",
      "Syncing study blueprint...",
    ],
    containerSize: "w-64 h-64 sm:w-[300px] sm:h-[300px] md:w-[330px] md:h-[330px]",
  },
  notes: {
    svgPath: "/loaders/notes.svg",
    alt: "Loading lecture notes",
    messages: [
      "Preparing lecture notes...",
      "Loading step-by-step proofs...",
      "Formatting key summaries...",
      "Opening study reader...",
    ],
    containerSize: "w-[320px] sm:w-[410px] md:w-[450px] aspect-[102/60]",
  },
  onboarding: {
    svgPath: "/loaders/onboarding.svg",
    alt: "Personalizing your profile",
    messages: [
      "Setting up your profile...",
      "Matching university syllabus...",
      "Preparing your courses...",
      "Getting everything ready...",
    ],
    containerSize: "w-64 sm:w-[300px] md:w-[330px] aspect-[11/10]",
  },
  default: {
    svgPath: "/loaders/dashboard.svg",
    alt: "Loading workspace",
    messages: [
      "Preparing your workspace...",
      "Loading study materials...",
      "Almost ready...",
    ],
    containerSize: "w-[310px] sm:w-[400px] md:w-[440px] aspect-[1625/990]",
  },
};

interface ScreenLoaderProps {
  variant?: LoaderVariant;
  customTitle?: string;
  customMessages?: string[];
}

export function ScreenLoader({
  variant = "dashboard",
  customTitle,
  customMessages,
}: ScreenLoaderProps) {
  const config = CONFIGS[variant] || CONFIGS.default;
  const messages =
    customMessages ?? (customTitle ? [customTitle, ...config.messages] : config.messages);

  const [messageIndex, setMessageIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  // Cycle short messages with a crisp exit fade + animated pop-up entrance
  useEffect(() => {
    if (messages.length <= 1) return;

    let swapTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const intervalId = setInterval(() => {
      setIsLeaving(true);
      swapTimeoutId = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setIsLeaving(false);
      }, 200);
    }, 2200);

    return () => {
      clearInterval(intervalId);
      if (swapTimeoutId) clearTimeout(swapTimeoutId);
    };
  }, [messages.length]);

  const activeMessage = messages[messageIndex % messages.length];

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative min-h-[70vh] w-full flex flex-col items-center justify-center px-4 py-8 select-none overflow-hidden"
    >
      {/* Animated SVG Illustration */}
      <div className={`relative ${config.containerSize} flex items-center justify-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.svgPath}
          alt={config.alt}
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>

      {/* Short Animated Pop-Up Message Underneath */}
      <div
        className={`mt-4 sm:mt-5 min-h-7 flex items-center justify-center transition-all duration-200 ease-out ${
          isLeaving ? "opacity-0 -translate-y-1.5 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <p
          key={messageIndex}
          className="animate-loader-pop text-sm sm:text-[15px] font-semibold tracking-tight text-[#434863] text-center"
        >
          {activeMessage}
        </p>
      </div>
    </div>
  );
}

export default ScreenLoader;
