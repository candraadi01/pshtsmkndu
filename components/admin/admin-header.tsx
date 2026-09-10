"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { logoutAction, type UserProfile } from "@/lib/services/auth";

interface AdminHeaderProps {
  profile: UserProfile;
}

export default function AdminHeader({ profile }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
  }, []);

  if (pathname === "/admin/login") return null;

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      startTransition(async () => {
        await logoutAction();
      });
    }
  };

  const isSuperAdmin = profile.role === "super_admin";

  const getPageTitleInfo = () => {
    if (pathname === "/admin") {
      return {
        title: "Ringkasan & Analitik",
        subtitle: "Pantau performa real-time dan statistik keseluruhan",
        icon: "fa-solid fa-chart-pie",
        iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      };
    }
    if (pathname.startsWith("/admin/artikel")) {
      return {
        title: "Artikel & Berita",
        subtitle: "Kelola publikasi informasi dan liputan kegiatan",
        icon: "fa-solid fa-newspaper",
        iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      };
    }
    if (pathname.startsWith("/admin/pengumuman")) {
      return {
        title: "Pengumuman Resmi",
        subtitle: "Siaran informasi penting untuk siswa dan anggota",
        icon: "fa-solid fa-bullhorn",
        iconColor: "text-rose-600 bg-rose-50 border-rose-200",
      };
    }
    if (pathname.startsWith("/admin/people")) {
      return {
        title: "Pelatih, Warga & Siswa",
        subtitle: "Database keanggotaan dan pendaftaran siswa baru",
        icon: "fa-solid fa-users",
        iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
      };
    }
    if (pathname.startsWith("/admin/galeri")) {
      return {
        title: "Galeri Foto",
        subtitle: "Dokumentasi visual kegiatan dan prestasi organisasi",
        icon: "fa-solid fa-images",
        iconColor: "text-purple-600 bg-purple-50 border-purple-200",
      };
    }
    if (pathname.startsWith("/admin/dokumen")) {
      return {
        title: "Dokumen Unduhan",
        subtitle: "Arsip surat, pedoman, dan formulir resmi",
        icon: "fa-solid fa-file-pdf",
        iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      };
    }
    if (pathname.startsWith("/admin/audit-logs")) {
      return {
        title: "Log Aktivitas Admin",
        subtitle: "Catatan tindakan dan audit keamanan sistem",
        icon: "fa-solid fa-clock-rotate-left",
        iconColor: "text-violet-600 bg-violet-50 border-violet-200",
      };
    }
    if (pathname.startsWith("/admin/users")) {
      return {
        title: "Kelola Akun Admin",
        subtitle: "Manajemen kredensial dan hak akses administrator",
        icon: "fa-solid fa-user-shield",
        iconColor: "text-orange-600 bg-orange-50 border-orange-200",
      };
    }
    if (pathname.startsWith("/admin/settings")) {
      return {
        title: "Pengaturan & Logo",
        subtitle: "Konfigurasi profil dan identitas organisasi",
        icon: "fa-solid fa-sliders",
        iconColor: "text-slate-600 bg-slate-100 border-slate-200",
      };
    }
    return {
      title: "Panel Admin",
      subtitle: "Kelola konten dan operasional website",
      icon: "fa-solid fa-gauge-high",
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
    };
  };

  const pageInfo = getPageTitleInfo();

  return (
    <div className="sticky top-0 z-30">
      {/* Decorative Rainbow Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-amber-500" />

      <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        {/* Title & Page Context */}
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border shadow-2xs shrink-0 ${pageInfo.iconColor}`}>
            <i className={pageInfo.icon} />
          </div>
          <div>
            <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{pageInfo.title}</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* User Info, Live Date & Actions */}
        <div className="flex items-center gap-3">
          {/* Live Date Pill */}
          {currentDate && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-semibold">
              <i className="fa-regular fa-calendar text-blue-600 text-xs" />
              <span>{currentDate}</span>
            </div>
          )}

          {/* Role & User Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/80 shadow-2xs">
            <div
              className={`w-2 h-2 rounded-full ring-2 ${
                isSuperAdmin ? "bg-amber-500 ring-amber-200" : "bg-blue-500 ring-blue-200"
              }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-wider ${
                isSuperAdmin ? "text-amber-700" : "text-blue-700"
              }`}
            >
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-900 font-bold max-w-[130px] truncate">
              {profile.display_name}
            </span>
          </div>

          {/* Website Link Shortcut */}
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs transition-colors"
            title="Lihat Website Publik"
          >
            <i className="fa-solid fa-globe" />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold transition-all shadow-2xs hover:shadow-sm"
            title="Keluar dari Panel Admin"
          >
            <i className={`fa-solid ${isPending ? "fa-circle-notch fa-spin" : "fa-arrow-right-from-bracket"}`} />
            <span>Keluar</span>
          </button>
        </div>
      </header>
    </div>
  );
}
