"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface LiveMetrics {
  totalVisits: number;
  todayVisits: number;
  totalArticleViews: number;
  totalArticles: number;
  totalPengumuman: number;
  totalDokumen: number;
  totalPelatih: number;
  totalWarga: number;
  totalSiswa: number;
  topArticles: Array<{
    id: number;
    judul: string;
    slug: string;
    view_count: number;
    kategori: string;
  }>;
  recentLogs: Array<{
    id: number;
    user_name: string;
    role: string;
    action: string;
    details: string | null;
    created_at: string;
  }>;
  recentStudents: Array<{
    id: number;
    nama: string;
    jenis_kelamin: string | null;
    alamat: string | null;
    no_hp: string | null;
    created_at: string;
  }>;
  timestamp?: string;
}

interface AdminLiveStatsProps {
  initialData: LiveMetrics;
  role: "admin" | "super_admin";
}

const POLL_INTERVAL = 15_000; // 15 seconds real-time update

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

/**
 * Shared hook for real-time polling of admin analytics
 */
function useLiveData(initialData: LiveMetrics) {
  const [data, setData] = useState<LiveMetrics>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const fetchLatest = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      });
      if (res.ok && mountedRef.current) {
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date());
        setIsLive(true);
      }
    } catch {
      if (mountedRef.current) setIsLive(false);
    } finally {
      if (mountedRef.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setInterval(fetchLatest, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchLatest]);

  return { data, lastUpdate, isLive, isRefreshing, refresh: fetchLatest };
}

// =============================================
// LIVE INDICATOR BADGE
// =============================================
function LiveBadge({ isLive, isRefreshing, lastUpdate }: { isLive: boolean; isRefreshing: boolean; lastUpdate: Date }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-500" : "bg-rose-500"}`} />
          </span>
          <span>{isLive ? "Data Real-time Aktif" : "Offline"}</span>
          {isRefreshing && <span className="text-emerald-600 font-normal"> • Memperbarui...</span>}
        </span>
      </div>
      <span className="text-xs text-slate-500 font-medium">
        Sinkronisasi otomatis tiap 15 detik • Terakhir: <span className="font-mono font-bold text-slate-800">{formatTime(lastUpdate)}</span>
      </span>
    </div>
  );
}

// =============================================
// MAIN ADMIN LIVE STATS (Vibrant KPI Cards)
// =============================================
export default function AdminLiveStats({ initialData, role }: AdminLiveStatsProps) {
  const { data, lastUpdate, isLive, isRefreshing } = useLiveData(initialData);

  if (role === "admin") {
    return (
      <div className="space-y-4">
        <LiveBadge isLive={isLive} isRefreshing={isRefreshing} lastUpdate={lastUpdate} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Artikel */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-orange-500/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Total Artikel</span>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
                <i className="fa-solid fa-newspaper" />
              </div>
            </div>
            <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalArticles}</div>
            <div className="mt-2 text-xs text-white/90 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
              <span>Berita & kegiatan terpublikasi</span>
            </div>
          </div>

          {/* Card 2: Lead Penonton */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-emerald-500/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Lead Penonton</span>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
                <i className="fa-solid fa-eye" />
              </div>
            </div>
            <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalArticleViews.toLocaleString("id-ID")}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25">
              <i className="fa-solid fa-chart-line text-[11px]" />
              <span>Total pembaca aktif</span>
            </div>
          </div>

          {/* Card 3: Siswa */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-indigo-500/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Siswa Terdaftar</span>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
                <i className="fa-solid fa-user-graduate" />
              </div>
            </div>
            <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalSiswa}</div>
            <div className="mt-2 text-xs text-white/90 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-200" />
              <span>Siswa aktif dalam binaan</span>
            </div>
          </div>

          {/* Card 4: Peran */}
          <div className="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-purple-500/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Peran Akun</span>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
                <i className="fa-solid fa-shield-halved" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-wider">ADMIN</div>
            <div className="mt-2 text-xs text-white/90 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-200" />
              <span>Akses artikel & data siswa</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================= SUPER ADMIN =======================
  return (
    <div className="space-y-4">
      <LiveBadge isLive={isLive} isRefreshing={isRefreshing} lastUpdate={lastUpdate} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Pengunjung (Royal Ocean Blue) */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-blue-500/25 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Total Pengunjung</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
              <i className="fa-solid fa-users-viewfinder" />
            </div>
          </div>
          <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalVisits.toLocaleString("id-ID")}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25">
            <i className="fa-solid fa-arrow-trend-up text-[11px] text-emerald-300" />
            <span>+{data.todayVisits} hari ini</span>
          </div>
        </div>

        {/* Card 2: Pembaca Artikel (Sunset Amber / Coral Orange) */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-orange-500/25 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Pembaca Artikel</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
              <i className="fa-solid fa-eye" />
            </div>
          </div>
          <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalArticleViews.toLocaleString("id-ID")}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25">
            <i className="fa-solid fa-newspaper text-[11px]" />
            <span>Dari {data.totalArticles} artikel publik</span>
          </div>
        </div>

        {/* Card 3: Total Anggota PSHT (Electric Violet / Purple) */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-purple-500/25 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Total Anggota PSHT</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
              <i className="fa-solid fa-id-card" />
            </div>
          </div>
          <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalPelatih + data.totalWarga + data.totalSiswa}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/30 text-white shadow-2xs">{data.totalPelatih} Pelatih</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/30 text-white shadow-2xs">{data.totalWarga} Warga</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-400/25 border border-sky-300/30 text-white shadow-2xs">{data.totalSiswa} Siswa</span>
          </div>
        </div>

        {/* Card 4: Dokumen & SK (Mint / Emerald Teal) */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-emerald-500/25 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-[1px] pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">Dokumen Unduhan</span>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg shadow-inner">
              <i className="fa-solid fa-file-lines" />
            </div>
          </div>
          <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">{data.totalDokumen}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25">
            <i className="fa-solid fa-download text-[11px]" />
            <span>Tersedia untuk unduh publik</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for category color
function getCategoryBadgeClass(kategori?: string) {
  const cat = (kategori || "Umum").toLowerCase();
  if (cat.includes("prestasi")) return "bg-emerald-50 text-emerald-700 border-emerald-300";
  if (cat.includes("kegiatan")) return "bg-blue-50 text-blue-700 border-blue-300";
  if (cat.includes("materi")) return "bg-purple-50 text-purple-700 border-purple-300";
  return "bg-amber-50 text-amber-800 border-amber-300";
}

// =============================================
// LIVE TOP ARTICLES TABLE (Lead Penonton)
// =============================================
export function AdminLiveTopArticles({ initialArticles }: { initialArticles: LiveMetrics["topArticles"] }) {
  const { data } = useLiveData({
    totalVisits: 0, todayVisits: 0, totalArticleViews: 0, totalArticles: 0,
    totalPengumuman: 0, totalDokumen: 0, totalPelatih: 0, totalWarga: 0, totalSiswa: 0,
    topArticles: initialArticles, recentLogs: [], recentStudents: [],
  });
  const articles = data.topArticles.length > 0 ? data.topArticles : initialArticles;

  if (articles.length === 0) {
    return <div className="text-center py-10 text-slate-400 text-sm">Belum ada data artikel terbaca.</div>;
  }

  const maxViews = Math.max(...articles.map((a) => a.view_count), 1);

  return (
    <div className="overflow-x-auto -mx-6 -mb-6">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-y border-slate-200 bg-slate-50/90 text-slate-700 text-[11px] uppercase tracking-wider">
            <th className="py-3 px-6 font-bold">Peringkat & Judul</th>
            <th className="py-3 px-4 font-bold">Kategori</th>
            <th className="py-3 px-4 font-bold text-right">Penonton</th>
            <th className="py-3 px-6 font-bold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {articles.map((article, idx) => (
            <tr key={article.id} className="hover:bg-amber-50/40 transition-colors">
              <td className="py-3.5 px-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-black shadow-xs shrink-0 ${
                      idx === 0
                        ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 ring-2 ring-amber-300 shadow-md shadow-amber-500/20"
                        : idx === 1
                        ? "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 ring-2 ring-slate-200"
                        : idx === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white ring-2 ring-amber-600/30"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {idx === 0 ? "👑" : idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 line-clamp-1 hover:text-amber-600 transition-colors">
                      {article.judul}
                    </span>
                    <div className="w-full max-w-[160px] bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? "bg-gradient-to-r from-amber-400 to-orange-500"
                            : idx === 1
                            ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                            : "bg-gradient-to-r from-emerald-400 to-teal-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(12, (article.view_count / maxViews) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4 text-slate-600">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getCategoryBadgeClass(article.kategori)}`}>
                  {article.kategori || "Umum"}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-black text-amber-600">
                <span className="inline-flex items-center gap-1">
                  <i className="fa-solid fa-eye text-xs text-amber-500" />
                  <span>{article.view_count.toLocaleString("id-ID")}</span>
                </span>
              </td>
              <td className="py-3.5 px-6 text-right">
                <a
                  href={`/artikel/${article.slug}`}
                  target="_blank"
                  className="text-slate-400 hover:text-amber-600 text-xs p-2 rounded-xl hover:bg-amber-50 transition-colors inline-block"
                  title="Buka Halaman Publik"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================
// LIVE ACTIVITY LOGS (Super Admin)
// =============================================
export function AdminLiveActivityLogs({ initialLogs }: { initialLogs: LiveMetrics["recentLogs"] }) {
  const { data, lastUpdate, isLive } = useLiveData({
    totalVisits: 0, todayVisits: 0, totalArticleViews: 0, totalArticles: 0,
    totalPengumuman: 0, totalDokumen: 0, totalPelatih: 0, totalWarga: 0, totalSiswa: 0,
    topArticles: [], recentLogs: initialLogs, recentStudents: [],
  });
  const logs = data.recentLogs.length > 0 ? data.recentLogs : initialLogs;

  return (
    <div>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-500" : "bg-rose-500"}`} />
        </span>
        <span className="text-[10px] text-slate-500 font-mono font-medium">Auto-sync 15s • {formatTime(lastUpdate)}</span>
      </div>

      {logs.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 border border-slate-200">
          Belum ada aktivitas admin tercatat.
        </div>
      ) : (
        <div className="space-y-2.5 text-xs">
          {logs.slice(0, 5).map((log) => {
            const isSuper = log.role === "super_admin";
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50/50 border border-slate-200/90 space-y-1.5 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ring-2 ${isSuper ? "bg-amber-500 ring-amber-200" : "bg-blue-500 ring-blue-200"}`} />
                    <span>{log.user_name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${isSuper ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}>
                      {isSuper ? "Super Admin" : "Admin"}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{formatDateShort(log.created_at)}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">{log.details || log.action}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href="/admin/audit-logs"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 text-violet-900 text-xs font-bold border border-violet-200 transition-all shadow-2xs hover:shadow-sm"
        >
          <i className="fa-solid fa-list-check text-xs text-violet-600" />
          <span>Buka Detail Audit Log Admin</span>
        </Link>
      </div>
    </div>
  );
}

// =============================================
// LIVE RECENT STUDENTS (Admin)
// =============================================
export function AdminLiveRecentStudents({ initialStudents }: { initialStudents: LiveMetrics["recentStudents"] }) {
  const { data, lastUpdate, isLive } = useLiveData({
    totalVisits: 0, todayVisits: 0, totalArticleViews: 0, totalArticles: 0,
    totalPengumuman: 0, totalDokumen: 0, totalPelatih: 0, totalWarga: 0, totalSiswa: 0,
    topArticles: [], recentLogs: [], recentStudents: initialStudents,
  });
  const students = data.recentStudents.length > 0 ? data.recentStudents : initialStudents;

  return (
    <div>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-500" : "bg-rose-500"}`} />
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Real-time • {formatTime(lastUpdate)}</span>
      </div>

      {students.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">Belum ada siswa terdata.</p>
      ) : (
        <div className="space-y-2.5 text-xs">
          {students.map((siswa) => (
            <div
              key={siswa.id}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/60 via-white to-slate-50 border border-blue-100/90 flex items-center justify-between text-slate-700 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                  {siswa.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{siswa.nama}</div>
                  <div className="text-[11px] text-slate-500">
                    {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} • {siswa.alamat || "Alamat -"}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold">
                Siswa
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
