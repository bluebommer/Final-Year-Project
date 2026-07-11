// Components/StatusComponents/ServiceWorkerRegistrar.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./styles/UpdateToast.module.css";

export default function ServiceWorkerRegistrar() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // next dev's HMR interaction with service workers is unreliable — only
    // register against a production build (npm run build && npm run start).
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[SW] registration failed:", err);
    });

    // sw.js calls skipWaiting() unconditionally on install, so a new worker
    // activates in the background as soon as it's ready. `controllerchange`
    // fires exactly when that swap happens on an already-open tab — the
    // right moment to tell the user a refresh will pick up new content.
    // (It does not fire on the very first, uncontrolled page load, so no
    // toast appears on a fresh visit.)
    function handleControllerChange() {
      setUpdateAvailable(true);
    }
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className={styles.toast} role="status">
      <span className={styles.message}>New content available</span>
      <button className={styles.refreshBtn} onClick={() => window.location.reload()}>
        Refresh
      </button>
    </div>
  );
}
