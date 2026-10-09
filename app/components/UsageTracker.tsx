"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  const storageKey = "phonoplay-session-id";

  try {
    let sessionId = sessionStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  } catch {
    // Tracking should still work if session storage is unavailable.
    return crypto.randomUUID();
  }
}

export default function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const startedAt = Date.now();
    const sessionId = getSessionId();

    const activityType =
      pathname === "/wordle"
        ? "WORDLE"
        : pathname === "/word-search"
          ? "WORD_SEARCH"
          : null;

    let recorded = false;

    async function recordUsage() {
      if (recorded) return;
      recorded = true;

      const durationMs = Math.max(0, Date.now() - startedAt);

      const payload = JSON.stringify({
        page: pathname,
        durationMs,
        activityType,
        sessionId,
      });

      try {
        await fetch("/api/analytics/usage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
          keepalive: true,
        });
      } catch (error) {
        console.error("Unable to record page usage:", error);
      }
    }

    window.addEventListener("pagehide", recordUsage);

    return () => {
      window.removeEventListener("pagehide", recordUsage);
      void recordUsage();
    };
  }, [pathname]);

  return null;
}
