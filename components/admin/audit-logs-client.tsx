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
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (action.startsWith("EDIT") || action.startsWith("UPDATE")) {
      return "bg-amber-50 text-amber-800 border border-amber-200";
    }
    if (action.startsWith("HAPUS")) {
      return "bg-rose-50 text-rose-700 border border-rose-200";
    }
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  const getActionIcon = (action: string) => {
    if (action.startsWith("TAMBAH") || action.startsWith("UPLOAD")) {
      return "fa-solid fa-circle-plus text-emerald-600";
    }
    if (action.startsWith("EDIT") || action.startsWith("UPDATE")) {
      return "fa-solid fa-pen-to-square text-amber-600";
    }
    if (action.startsWith("HAPUS")) {
      return "fa-solid fa-trash-can text-rose-600";
    }
    return "fa-solid fa-circle-info text-blue-600";
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters Card */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama admin, artikel, siswa, atau rincian aktivitas..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              aria-label="Filter berdasarkan hak akses"
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin Biasa</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors"
              title="Segarkan data log"
            >
              <i className="fa-solid fa-rotate text-xs" />
            </button>
          </div>
        </div>

        {/* Action Type Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {[
            { id: "all", label: "Semua Aksi", icon: "fa-solid fa-list text-slate-500" },
            { id: "TAMBAH", label: "Tambah / Unggah", icon: "fa-solid fa-plus text-emerald-600" },
            { id: "EDIT", label: "Perubahan / Edit", icon: "fa-solid fa-pen text-amber-600" },
            { id: "HAPUS", label: "Penghapusan", icon: "fa-solid fa-trash text-rose-600" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedAction(pill.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAction === pill.id
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              <i className={pill.icon} />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm border-t-4 border-t-violet-500">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-violet-600" />
              <span>Riwayat Aktivitas Tercatat</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Menampilkan {filteredLogs.length} dari total {logs.length} kegiatan admin tersimpan
            </p>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <i className="fa-solid fa-inbox text-lg" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum ada catatan aktivitas.</p>
            <p className="text-xs text-slate-400 mt-1">
              Aktivitas admin saat menambah artikel, mengubah siswa, atau menghapus data akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3.5 px-5 font-bold">Waktu</th>
                  <th className="py-3.5 px-4 font-bold">Admin / Pelaku</th>
                  <th className="py-3.5 px-4 font-bold">Jenis Tindakan</th>
                  <th className="py-3.5 px-4 font-bold">Modul</th>
                  <th className="py-3.5 px-5 font-bold">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-violet-50/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div className="font-bold text-slate-700">{formatIndonesianDate(log.created_at)}</div>
                      <div className="text-slate-400 text-[10px]">
                        {new Date(log.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}{" "}
                        WIB
                      </div>
                    </td>

                    {/* Admin User */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 font-black flex items-center justify-center text-xs shrink-0">
                          {log.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{log.user_name}</div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-md ${
                              log.role === "super_admin"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {log.role === "super_admin" ? "Super Admin" : "Admin"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${getActionBadge(
                          log.action
                        )}`}
                      >
                        <i className={getActionIcon(log.action)} />
                        <span>{log.action}</span>
                      </span>
                    </td>

                    {/* Module / Entity */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold capitalize border border-slate-200/80">
                        {log.entity}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-4 px-5 text-slate-600 text-xs max-w-md">
                      <p className="line-clamp-2 leading-relaxed font-medium">{log.details || "-"}</p>
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
