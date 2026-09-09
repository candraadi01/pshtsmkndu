"use client";

import { useState } from "react";
import { formatIndonesianDate } from "@/lib/date";
import type { ActivityLog } from "@/lib/services/activity-logger";

export default function AuditLogsClient({ initialLogs }: { initialLogs: ActivityLog[] }) {
  const [logs] = useState<ActivityLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchSearch =
      log.user_name.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      log.entity.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term);

    const matchAction =
      selectedAction === "all" ||
      (selectedAction === "TAMBAH" && log.action.startsWith("TAMBAH")) ||
      (selectedAction === "EDIT" && log.action.startsWith("EDIT")) ||
      (selectedAction === "HAPUS" && log.action.startsWith("HAPUS")) ||
      (selectedAction === "LAINNYA" &&
        !log.action.startsWith("TAMBAH") &&
        !log.action.startsWith("EDIT") &&
        !log.action.startsWith("HAPUS"));

    const matchRole = selectedRole === "all" || log.role === selectedRole;

    return matchSearch && matchAction && matchRole;
  });

  const getActionBadge = (action: string) => {
    if (action.startsWith("TAMBAH") || action.startsWith("UPLOAD")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
    }
    if (action.startsWith("EDIT") || action.startsWith("UPDATE")) {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
    }
    if (action.startsWith("HAPUS")) {
      return "bg-red-500/10 text-red-400 border border-red-500/30";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
  };

  const getActionIcon = (action: string) => {
    if (action.startsWith("TAMBAH") || action.startsWith("UPLOAD")) {
      return "fa-solid fa-circle-plus";
    }
    if (action.startsWith("EDIT") || action.startsWith("UPDATE")) {
      return "fa-solid fa-pen-to-square";
    }
    if (action.startsWith("HAPUS")) {
      return "fa-solid fa-trash-can";
    }
    return "fa-solid fa-info-circle";
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-[#151d2a] p-4 sm:p-5 rounded-3xl border border-gray-800 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama admin, artikel, siswa, atau rincian aktivitas..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#0b0f17] border border-gray-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              aria-label="Filter berdasarkan hak akses"
              className="px-3 py-2 bg-[#0b0f17] border border-gray-700/80 rounded-xl text-xs font-semibold text-gray-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin Biasa</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors"
              title="Segarkan data log"
            >
              <i className="fa-solid fa-rotate text-xs" />
            </button>
          </div>
        </div>

        {/* Action Type Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800/80">
          {[
            { id: "all", label: "Semua Aksi", icon: "fa-solid fa-list" },
            { id: "TAMBAH", label: "Tambah / Unggah", icon: "fa-solid fa-plus text-emerald-400" },
            { id: "EDIT", label: "Perubahan / Edit", icon: "fa-solid fa-pen text-amber-400" },
            { id: "HAPUS", label: "Penghapusan", icon: "fa-solid fa-trash text-red-400" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedAction(pill.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedAction === pill.id
                  ? "bg-amber-500 text-gray-950 font-bold shadow-sm"
                  : "bg-[#0b0f17] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              <i className={pill.icon} />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / Feed */}
      <div className="bg-[#151d2a] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-amber-400" />
              <span>Riwayat Aktivitas Tercatat</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Menampilkan {filteredLogs.length} dari total {logs.length} kegiatan admin tersimpan
            </p>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800/80 mx-auto flex items-center justify-center text-gray-500 mb-3">
              <i className="fa-solid fa-inbox text-lg" />
            </div>
            <p className="text-sm font-semibold text-gray-300">Belum ada catatan aktivitas.</p>
            <p className="text-xs text-gray-500 mt-1">
              Aktivitas admin saat menambah artikel, mengubah siswa, atau menghapus data akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0f172a] text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-semibold">Waktu</th>
                  <th className="p-4 font-semibold">Admin / Pelaku</th>
                  <th className="p-4 font-semibold">Jenis Tindakan</th>
                  <th className="p-4 font-semibold">Modul</th>
                  <th className="p-4 font-semibold">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="p-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      <div>{formatIndonesianDate(log.created_at)}</div>
                      <div className="text-gray-500 text-[10px]">
                        {new Date(log.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}{" "}
                        WIB
                      </div>
                    </td>

                    {/* Admin User */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {log.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-200">{log.user_name}</div>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              log.role === "super_admin"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {log.role === "super_admin" ? "Super Admin" : "Admin"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${getActionBadge(
                          log.action
                        )}`}
                      >
                        <i className={`${getActionIcon(log.action)} text-xs`} />
                        <span>{log.action}</span>
                      </span>
                    </td>

                    {/* Module / Entity */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 font-mono text-xs capitalize">
                        {log.entity}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="p-4 text-gray-300 text-xs max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{log.details || "-"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
