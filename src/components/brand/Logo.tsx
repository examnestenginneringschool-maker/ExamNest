import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  withText?: boolean;
  subtitle?: string;
  href?: string;
}

const SIZE_MAP = {
  xs: { px: 24, class: "h-6 w-6 rounded-lg" },
  sm: { px: 32, class: "h-8 w-8 rounded-xl" },
  md: { px: 40, class: "h-10 w-10 rounded-2xl" },
  lg: { px: 48, class: "h-12 w-12 rounded-2xl" },
  xl: { px: 64, class: "h-16 w-16 rounded-3xl" },
};

export function LogoImage({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const config = SIZE_MAP[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden shadow-xs select-none transition-transform duration-300 ${config.class} ${className}`}
    >
      <Image
        src="/logo.png"
        alt="ExamNest Logo"
        width={config.px}
        height={config.px}
        priority
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function Logo({
  size = "md",
  className = "",
  withText = true,
  subtitle,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoImage size={size} />
      {withText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight text-[#1B1B2F] ${
              size === "xs"
                ? "text-sm"
                : size === "sm"
                ? "text-base"
                : size === "md"
                ? "text-xl"
                : size === "lg"
                ? "text-2xl"
                : "text-3xl"
            }`}
          >
            ExamNest
          </span>
          {subtitle && (
            <span className="-mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#717588]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
