import Link from "next/link";
import { getDashboardAnalytics } from "@/lib/services/analytics";
import { getCurrentUserProfile, requireAdmin } from "@/lib/services/auth";
import { getAdminActivityLogs } from "@/lib/services/activity-logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ResetMetricsButton from "@/components/admin/reset-metrics-button";
import AdminLiveStats, {
  AdminLiveTopArticles,
  AdminLiveActivityLogs,
  AdminLiveRecentStudents,
} from "@/components/admin/admin-live-stats";

import { getStoredPeople } from "@/lib/services/people-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const isSuperAdmin = profile.role === "super_admin";

  const [analytics, recentLogs, recentStudents] = await Promise.all([
    getDashboardAnalytics(),
    isSuperAdmin ? getAdminActivityLogs(8) : Promise.resolve([]),
    !isSuperAdmin
      ? getStoredPeople("siswa").then((res) => res.slice(0, 6))
      : Promise.resolve([]),
  ]);

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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Vibrant Modern Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 lg:p-9 shadow-xl shadow-indigo-500/20 border border-white/10">
        {/* Ambient Glows */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-60 h-60 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sky-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <i className="fa-solid fa-user-gear text-xs text-amber-300" />
              <span>Panel Operasional Admin</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Halo, {profile.display_name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed font-medium">
              Selamat bertugas. Akun Anda memiliki izin khusus untuk mengelola publikasi artikel/berita dan memverifikasi data siswa PSHT SMKN Darul Ulum Muncar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/artikel"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/30 hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-pen-nib text-xs" />
              <span>Tulis Artikel Baru</span>
            </Link>
            <Link
              href="/admin/people"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md shadow-sm hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-user-plus text-xs text-sky-300" />
              <span>Daftar Siswa Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid - Live Auto-Refresh */}
      <AdminLiveStats initialData={analytics} role="admin" />

      {/* Main Grid: Top Articles & Siswa Terdaftar Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles (Lead Penonton) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-fire text-amber-500" />
                <span>Peringkat Artikel Terpopuler (Lead Penonton)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Artikel dengan jumlah tayangan dan minat baca tertinggi
              </p>
            </div>
            <Link
              href="/admin/artikel"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Kelola Semua →
            </Link>
          </div>

          <AdminLiveTopArticles initialArticles={analytics.topArticles} />
        </div>

        {/* Siswa Terbaru & Shortcut Cepat */}
        <div className="space-y-6">
          {/* Siswa Terdaftar Terbaru */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm border-t-4 border-t-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-user-graduate text-blue-600" />
                <span>Siswa Terdaftar Terbaru</span>
              </h3>
              <Link href="/admin/people" className="text-[11px] font-bold text-blue-600 hover:underline">
                Lihat →
              </Link>
            </div>

            <AdminLiveRecentStudents initialStudents={recentStudents} />
          </div>

          {/* Quick Actions Berwarna */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500" />
              <span>Akses Cepat</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/admin/artikel"
                className="p-3.5 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white hover:from-amber-100 hover:to-orange-50 rounded-2xl border border-amber-200/80 transition-all flex items-center gap-3.5 group shadow-2xs hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-newspaper text-sm" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Kelola Artikel & Liputan</div>
                  <div className="text-[10px] text-amber-700 font-medium">Tulis berita dan update informasi</div>
                </div>
              </Link>
              <Link
                href="/admin/people"
                className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white hover:from-blue-100 hover:to-indigo-50 rounded-2xl border border-blue-200/80 transition-all flex items-center gap-3.5 group shadow-2xs hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-user-graduate text-sm" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Kelola Data Siswa</div>
                  <div className="text-[10px] text-blue-700 font-medium">Pendaftaran dan verifikasi siswa</div>
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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Vibrant Modern Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-9 shadow-xl shadow-indigo-950/30 border border-indigo-900/50">
        {/* Ambient Floating Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/25 to-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -bottom-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute left-10 -top-10 w-40 h-40 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <i className="fa-solid fa-crown text-amber-400 text-xs" />
              <span>Super Administrator Mode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Selamat Datang, {profile.display_name}! 👑
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              Kendali penuh seluruh fitur website, pemantauan log kegiatan admin, pengelolaan pelatih, warga, siswa, galeri, serta dokumen resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-clock-rotate-left text-xs" />
              <span>Pantau Kegiatan Admin</span>
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md shadow-sm hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-user-shield text-xs text-amber-300" />
              <span>Kelola Akun Admin</span>
            </Link>
            <ResetMetricsButton />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid Eksekutif - Live Auto-Refresh */}
      <AdminLiveStats initialData={analytics} role="super_admin" />

      {/* Main Grid: Top Articles & Live Feed Kegiatan Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles (Lead Penonton) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-fire text-amber-500" />
                <span>Artikel Paling Banyak Dibaca (Lead Penonton)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Peringkat artikel berdasarkan views pembaca aktif di website
              </p>
            </div>
            <Link
              href="/admin/artikel"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          <AdminLiveTopArticles initialArticles={analytics.topArticles} />
        </div>

        {/* Column 2: Live Feed Kegiatan Admin & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Live Feed Kegiatan Admin */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm border-t-4 border-t-violet-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-violet-600" />
                  <span>Aktivitas Admin Terkini</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Tindakan operasional yang baru dilakukan</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-[11px] font-bold text-violet-600 hover:text-violet-700"
              >
                Semua →
              </Link>
            </div>

            <AdminLiveActivityLogs initialLogs={recentLogs} />
          </div>

          {/* Quick Shortcuts Eksekutif Berwarna-Warni */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-grip text-indigo-600" />
              <span>Kelola Sistem Super Admin</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Shortcut 1: Admin */}
              <Link
                href="/admin/users"
                className="p-3.5 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-white hover:from-amber-500/20 hover:to-white rounded-2xl border border-amber-200/90 text-xs transition-all flex flex-col gap-2 group hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/25 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-user-shield text-xs" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block">Kelola Admin</span>
                  <span className="text-[10px] text-amber-700 font-medium">Akses & otorisasi</span>
                </div>
              </Link>

              {/* Shortcut 2: Galeri Foto */}
              <Link
                href="/admin/galeri"
                className="p-3.5 bg-gradient-to-br from-purple-500/10 via-pink-50/30 to-white hover:from-purple-500/20 hover:to-white rounded-2xl border border-purple-200/90 text-xs transition-all flex flex-col gap-2 group hover:shadow-md hover:shadow-purple-500/10 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-sm shadow-purple-500/25 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-images text-xs" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block">Galeri Foto</span>
                  <span className="text-[10px] text-purple-700 font-medium">Dokumentasi kegiatan</span>
                </div>
              </Link>

              {/* Shortcut 3: Dokumen Unduhan */}
              <Link
                href="/admin/dokumen"
                className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-50/30 to-white hover:from-emerald-500/20 hover:to-white rounded-2xl border border-emerald-200/90 text-xs transition-all flex flex-col gap-2 group hover:shadow-md hover:shadow-emerald-500/10 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-file-arrow-up text-xs" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block">Dokumen Unduhan</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Surat & formulir</span>
                </div>
              </Link>

              {/* Shortcut 4: Pengaturan & Logo */}
              <Link
                href="/admin/settings"
                className="p-3.5 bg-gradient-to-br from-blue-500/10 via-indigo-50/30 to-white hover:from-blue-500/20 hover:to-white rounded-2xl border border-blue-200/90 text-xs transition-all flex flex-col gap-2 group hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-sliders text-xs" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block">Pengaturan</span>
                  <span className="text-[10px] text-blue-700 font-medium">Profil organisasi</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
