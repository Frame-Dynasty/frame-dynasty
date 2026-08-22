"use client";

import { useEffect } from "react";

export default function ScanTracker({ frameId }: { frameId: string }) {
  useEffect(() => {
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frameId }),
      keepalive: true,
    }).catch(() => {});
  }, [frameId]);

  return null;
}
