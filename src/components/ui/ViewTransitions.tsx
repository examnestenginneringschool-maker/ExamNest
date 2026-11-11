import { ViewTransition, type ReactNode } from "react";

interface TransitionWrapperProps {
  children: ReactNode;
}

/**
 * Smooth, zero-lag page transition wrapper powered by React's built-in <ViewTransition>.
 * `default="none"` keeps unrelated in-page state transitions from triggering full-page fades.
 */
export function PageTransition({ children }: TransitionWrapperProps) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * Smooth handoff wrapper for route `loading.tsx` boundaries (ScreenLoader).
 */
export function LoaderTransition({ children }: TransitionWrapperProps) {
  return (
    <ViewTransition enter="loader-enter" exit="loader-exit" default="none">
      {children}
    </ViewTransition>
  );
}
