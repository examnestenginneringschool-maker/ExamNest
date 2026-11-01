"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function getBrowserDeviceCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("examnest_device_token="));
  return match ? decodeURIComponent(match.split("=")[1] || "") : null;
}

/**
 * Real-time client-side single-device session monitor.
 * Immediately expires the local session and redirects to `/sign-in?reason=session_replaced`
 * as soon as a newer login is detected on another device or browser.
 */
export function SingleSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    const verifySingleDeviceLock = async () => {
      try {
        const localDeviceToken = getBrowserDeviceCookie();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error || !user) {
          await supabase.auth.signOut({ scope: "local" }).catch(() => {});
          router.replace("/sign-in?reason=session_replaced");
          router.refresh();
          return;
        }

        const serverActiveToken =
          typeof user.user_metadata?.active_device_token === "string"
            ? user.user_metadata.active_device_token
            : null;

        // If the server has an active_device_token that does not match this browser's token,
        // another device or browser has signed in with this account.
        if (
          serverActiveToken &&
          (!localDeviceToken || serverActiveToken !== localDeviceToken)
        ) {
          document.cookie =
            "examnest_device_token=; path=/; max-age=0; SameSite=Lax";
          await supabase.auth.signOut({ scope: "local" }).catch(() => {});
          router.replace("/sign-in?reason=session_replaced");
          router.refresh();
        }
      } catch {
        // Ignore transient network errors
      }
    };

    // Check every 15 seconds while tab is open, plus immediately on tab focus/visibility
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void verifySingleDeviceLock();
      }
    }, 15000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void verifySingleDeviceLock();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [router]);

  return null;
}
