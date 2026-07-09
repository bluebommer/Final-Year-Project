// Components/StatusComponents/ServiceWorkerRegistrar.tsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    // next dev's HMR interaction with service workers is unreliable — only
    // register against a production build (npm run build && npm run start).
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[SW] registration failed:", err);
    });
  }, []);

  return null;
}
