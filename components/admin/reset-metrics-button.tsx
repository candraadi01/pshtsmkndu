"use client";

import { useTransition } from "react";
import { resetAllMetricsAction } from "@/lib/services/analytics";

export default function ResetMetricsButton() {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mereset seluruh lead penonton artikel dan total kunjungan website mulai dari 0? Tindakan ini akan mengosongkan statistik kunjungan."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await resetAllMetricsAction();
      if (res.success) {
        alert("Berhasil! Penonton artikel dan total kunjungan website telah direset ke 0.");
        window.location.reload();
      } else {
        alert("Gagal mereset: " + res.error);
      }
    });
  };

  return (
    <button
      onClick={handleReset}
      disabled={isPending}
      title="Reset penonton artikel dan kunjungan website ke 0"
      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-semibold text-xs border border-rose-200 shadow-sm transition-all disabled:opacity-50"
    >
      <i className={`fa-solid ${isPending ? "fa-spinner fa-spin" : "fa-rotate-left"} text-xs`} />
      <span>{isPending ? "Mereset..." : "Reset Penonton & Kunjungan"}</span>
    </button>
  );
}
