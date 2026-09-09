import Link from "next/link";
import { getDashboardAnalytics } from "@/lib/services/analytics";
import { getCurrentUserProfile, requireAdmin } from "@/lib/services/auth";
import { getAdminActivityLogs } from "@/lib/services/activity-logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatIndonesianDate } from "@/lib/date";
import ResetMetricsButton from "@/components/admin/reset-metrics-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const isSuperAdmin = profile.role === "super_admin";
  const supabase = await createSupabaseServerClient();

  const [analytics, recentLogs, recentStudentsRes] = await Promise.all([
    getDashboardAnalytics(),
    isSuperAdmin ? getAdminActivityLogs(8) : Promise.resolve([]),
    !isSuperAdmin
      ? supabase
          .from("people")
          .select("id, nama, jenis_kelamin, alamat, no_hp, created_at")
          .eq("tipe", "siswa")
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
  ]);

  const recentStudents = recentStudentsRes.data || [];

  if (isSuperAdmin) {
    return (
      <SuperAdminDashboardView
        profile={profile}
        analytics={analytics}
        recentLogs={recentLogs}
      />
    );
  }

  return (
    <AdminDashboardView
      profile={profile}
      analytics={analytics}
      recentStudents={recentStudents}
    />
  );
}

// ==========================================
// 1. DASHBOARD KHUSUS ROLE ADMIN
// Fokus: Penulisan & Pembaca Artikel + Pendataan Siswa
// ==========================================
function AdminDashboardView({
  profile,
  analytics,
  recentStudents,
}: {
  profile: any;
  analytics: any;
  recentStudents: any[];
}) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#1e293b] to-[#0f172a] p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-user-gear text-xs" />
              <span>Panel Operasional Admin</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              Halo, {profile.display_name}! 👋
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
              Selamat bertugas. Akun Anda memiliki izin khusus untuk mengelola publikasi artikel/berita dan memverifikasi data siswa PSHT SMKN Darul Ulum Muncar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/artikel"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <i className="fa-solid fa-pen-nib text-xs" />
              <span>Tulis Artikel</span>
            </Link>
            <Link
              href="/admin/people"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <i className="fa-solid fa-user-plus text-xs" />
              <span>Daftar Siswa Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Khusus Admin: Artikel & Siswa) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Artikel */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Artikel
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <i className="fa-solid fa-newspaper text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalArticles}
          </div>
          <div className="mt-1 text-xs text-gray-400 font-medium">
            Berita & kegiatan terpublikasi
          </div>
        </div>

        {/* Lead Penonton Artikel */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Lead Penonton Artikel
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <i className="fa-solid fa-eye text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalArticleViews.toLocaleString("id-ID")}
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <i className="fa-solid fa-chart-line" />
            <span>Total pembaca aktif</span>
          </div>
        </div>

        {/* Total Siswa Terdaftar */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Siswa Terdaftar
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <i className="fa-solid fa-user-graduate text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalSiswa}
          </div>
          <div className="mt-1 text-xs text-gray-400 font-medium">
            Siswa aktif dalam binaan
          </div>
        </div>

        {/* Status Akses Akun */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Peran Akun
            </span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <i className="fa-solid fa-shield text-base" />
            </div>
          </div>
          <div className="mt-3 text-xl sm:text-2xl font-extrabold text-amber-400 uppercase tracking-wider">
            ADMIN
          </div>
          <div className="mt-1 text-xs text-gray-400 font-medium">
            Akses artikel & data siswa
          </div>
        </div>
      </div>

      {/* Main Grid: Top Articles & Siswa Terdaftar Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles (Lead Penonton) */}
        <div className="lg:col-span-2 bg-[#151d2a] p-6 rounded-3xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-fire text-amber-500" />
                <span>Peringkat Artikel Terpopuler (Lead Penonton)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Artikel dengan jumlah tayangan dan minat baca tertinggi
              </p>
            </div>
            <Link
              href="/admin/artikel"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Kelola Semua →
            </Link>
          </div>

          {analytics.topArticles.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              Belum ada data artikel terbaca.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Judul Artikel</th>
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold text-right">Penonton</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {analytics.topArticles.map((article: any, idx: number) => (
                    <tr key={article.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                              idx === 0 ? "bg-amber-500 text-gray-950" : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-gray-200 line-clamp-1">
                            {article.judul}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-gray-400">
                        <span className="px-2 py-0.5 rounded-md bg-gray-800 text-[11px]">
                          {article.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-amber-400">
                        <i className="fa-solid fa-eye text-xs mr-1 opacity-70" />
                        {article.view_count.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/artikel/${article.slug}`}
                          target="_blank"
                          className="text-gray-400 hover:text-white text-xs p-1"
                          title="Buka Halaman Publik"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Siswa Terbaru & Shortcut Cepat */}
        <div className="space-y-6">
          {/* Siswa Terdaftar Terbaru */}
          <div className="bg-[#151d2a] p-6 rounded-3xl border border-gray-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-user-graduate text-blue-400" />
                <span>Siswa Terdaftar Terbaru</span>
              </h3>
              <Link href="/admin/people" className="text-[11px] text-blue-400 hover:underline">
                Lihat →
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <p className="text-xs text-gray-500 py-3">Belum ada siswa terdata.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {recentStudents.map((siswa: any) => (
                  <div
                    key={siswa.id}
                    className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-800/60 flex items-center justify-between text-gray-300"
                  >
                    <div>
                      <div className="font-bold text-gray-200">{siswa.nama}</div>
                      <div className="text-[10px] text-gray-500">
                        {siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} • {siswa.alamat || "Alamat -"}
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      Siswa
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#151d2a] p-6 rounded-3xl border border-gray-800 shadow-md">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-400" />
              <span>Akses Cepat</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/admin/artikel"
                className="p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 text-xs font-medium text-gray-200 hover:text-white transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-newspaper" />
                </div>
                <div>
                  <div className="font-bold">Kelola Artikel</div>
                  <div className="text-[10px] text-gray-400">Tulis berita dan update informasi</div>
                </div>
              </Link>
              <Link
                href="/admin/people"
                className="p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 text-xs font-medium text-gray-200 hover:text-white transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-user-graduate" />
                </div>
                <div>
                  <div className="font-bold">Kelola Data Siswa</div>
                  <div className="text-[10px] text-gray-400">Pendaftaran dan verifikasi siswa</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD KHUSUS ROLE SUPER ADMIN
// Eksekutif: Traffic, Seluruh Anggota, Dokumen & Log Aktivitas Admin
// ==========================================
function SuperAdminDashboardView({
  profile,
  analytics,
  recentLogs,
}: {
  profile: any;
  analytics: any;
  recentLogs: any[];
}) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e293b] via-[#1a2333] to-[#0f172a] p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-crown text-xs" />
              <span>Super Administrator Mode</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              Selamat Datang, {profile.display_name}! 👑
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
              Kendali penuh seluruh fitur website, pemantauan log kegiatan admin, pengelolaan pelatih, warga, siswa, galeri, serta dokumen resmi.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <i className="fa-solid fa-clock-rotate-left text-xs" />
              <span>Pantau Kegiatan Admin</span>
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium text-xs sm:text-sm border border-gray-700 transition-all"
            >
              <i className="fa-solid fa-user-shield text-xs text-amber-400" />
              <span>Kelola Akun Admin</span>
            </Link>
            <ResetMetricsButton />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid Eksekutif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Pengunjung */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Pengunjung
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <i className="fa-solid fa-users-viewfinder text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalVisits.toLocaleString("id-ID")}
          </div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <i className="fa-solid fa-arrow-trend-up" />
            <span>+{analytics.todayVisits} pengunjung hari ini</span>
          </div>
        </div>

        {/* Lead Penonton Artikel */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pembaca Artikel
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <i className="fa-solid fa-eye text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalArticleViews.toLocaleString("id-ID")}
          </div>
          <div className="mt-1 text-xs text-gray-400 font-medium">
            Dari {analytics.totalArticles} artikel terpublikasi
          </div>
        </div>

        {/* Total Seluruh Anggota */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Anggota PSHT
            </span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <i className="fa-solid fa-id-card text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalPelatih + analytics.totalWarga + analytics.totalSiswa}
          </div>
          <div className="mt-1 text-xs text-gray-400 font-medium flex gap-2">
            <span>{analytics.totalPelatih} Pelatih</span>•
            <span>{analytics.totalWarga} Warga</span>•
            <span>{analytics.totalSiswa} Siswa</span>
          </div>
        </div>

        {/* Dokumen & Regulasi */}
        <div className="bg-[#151d2a] p-5 rounded-2xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Dokumen & SK
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <i className="fa-solid fa-file-lines text-base" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalDokumen}
          </div>
          <div className="mt-1 text-xs text-gray-400 font-medium">
            Tersedia untuk diunduh publik
          </div>
        </div>
      </div>

      {/* Main Grid: Top Articles & Live Feed Kegiatan Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles (Lead Penonton) */}
        <div className="lg:col-span-2 bg-[#151d2a] p-6 rounded-3xl border border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-fire text-amber-500" />
                <span>Artikel Paling Banyak Dibaca (Lead Penonton)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Peringkat artikel berdasarkan views pembaca aktif di website
              </p>
            </div>
            <Link
              href="/admin/artikel"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Lihat Semua →
            </Link>
          </div>

          {analytics.topArticles.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              Belum ada data artikel terbaca.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Judul Artikel</th>
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold text-right">Penonton</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {analytics.topArticles.map((article: any, idx: number) => (
                    <tr key={article.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                              idx === 0 ? "bg-amber-500 text-gray-950" : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-gray-200 line-clamp-1">
                            {article.judul}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-gray-400">
                        <span className="px-2 py-0.5 rounded-md bg-gray-800 text-[11px]">
                          {article.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-amber-400">
                        <i className="fa-solid fa-eye text-xs mr-1 opacity-70" />
                        {article.view_count.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/artikel/${article.slug}`}
                          target="_blank"
                          className="text-gray-400 hover:text-white text-xs p-1"
                          title="Buka Halaman"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FITUR UTAMA: Live Feed Kegiatan Admin */}
        <div className="space-y-6">
          <div className="bg-[#151d2a] p-6 rounded-3xl border border-amber-500/20 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-amber-400" />
                  <span>Aktivitas Admin Terkini</span>
                </h3>
                <p className="text-[10px] text-gray-400">Tindakan operasional yang baru dilakukan</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
              >
                Semua →
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-800/30 text-center text-xs text-gray-400">
                Belum ada aktivitas admin tercatat.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {recentLogs.slice(0, 5).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{log.user_name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-700 text-gray-300 font-normal">
                          {log.role}
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                        {formatIndonesianDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                      {log.details || log.action}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-800/80">
              <Link
                href="/admin/audit-logs"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-semibold border border-gray-700 transition-colors"
              >
                <i className="fa-solid fa-list-check text-xs text-amber-400" />
                <span>Buka Detail Audit Log Admin</span>
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts Eksekutif */}
          <div className="bg-[#151d2a] p-6 rounded-3xl border border-gray-800 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-sliders text-purple-400" />
              <span>Kelola Sistem Super Admin</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/users"
                className="p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 text-xs font-medium text-gray-200 hover:text-white transition-colors flex flex-col gap-1"
              >
                <i className="fa-solid fa-user-shield text-amber-400 text-base" />
                <span>Kelola Admin</span>
              </Link>
              <Link
                href="/admin/galeri"
                className="p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 text-xs font-medium text-gray-200 hover:text-white transition-colors flex flex-col gap-1"
              >
                <i className="fa-solid fa-images text-blue-400 text-base" />
                <span>Galeri Foto</span>
              </Link>
              <Link
                href="/admin/dokumen"
                className="p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 text-xs font-medium text-gray-200 hover:text-white transition-colors flex flex-col gap-1"
              >
                <i className="fa-solid fa-file-arrow-up text-emerald-400 text-base" />
                <span>Dokumen Unduhan</span>
              </Link>
              <Link
                href="/admin/settings"
                className="p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 text-xs font-medium text-gray-200 hover:text-white transition-colors flex flex-col gap-1"
              >
                <i className="fa-solid fa-sliders text-purple-400 text-base" />
                <span>Pengaturan & Logo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
