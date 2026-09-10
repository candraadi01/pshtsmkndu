"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "psht_site_visited_session";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Hanya hitung saat pengunjung membuka halaman utama / beranda ("/")
    if (pathname !== "/") {
      return;
    }

    // Cegah duplikasi kunjungan dalam satu sesi browser (refresh berulang kali tidak dihitung)
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const hasVisited = sessionStorage.getItem(SESSION_KEY);
        if (hasVisited) {
          return;
        }
        sessionStorage.setItem(SESSION_KEY, "true");
      }
    } catch {
      // Abaikan jika browser membatasi sessionStorage
    }

    try {
      fetch("/api/record-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }, [pathname]);

  return null;
}

