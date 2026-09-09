"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { logoutAction, type UserProfile } from "@/lib/services/auth";

interface AdminHeaderProps {
  profile: UserProfile;
}

export default function AdminHeader({ profile }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (pathname === "/admin/login") return null;

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      startTransition(async () => {
        await logoutAction();
      });
    }
  };

  const isSuperAdmin = profile.role === "super_admin";

  return (
    <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-4 bg-[#111827]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
      {/* Title / Breadcrumb */}
      <div>
        <h1 className="text-base lg:text-lg font-bold text-white capitalize">
          {pathname === "/admin"
            ? "Ringkasan & Analitik"
            : pathname.replace("/admin/", "").replace("-", " ")}
        </h1>
        <p className="text-[11px] text-gray-400">
          Kelola seluruh konten, publikasi, dan operasional website resmi PSHT
        </p>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/60">
          <div
            className={`w-2 h-2 rounded-full ${
              isSuperAdmin ? "bg-amber-400 animate-pulse" : "bg-blue-400"
            }`}
          />
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider ${
              isSuperAdmin ? "text-amber-400" : "text-blue-300"
            }`}
          >
            {isSuperAdmin ? "Super Admin" : "Admin"}
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-xs text-gray-200 font-semibold max-w-[140px] truncate">
            {profile.display_name}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 text-xs font-semibold transition-all"
          title="Keluar"
        >
          <i className={`fa-solid ${isPending ? "fa-circle-notch fa-spin" : "fa-arrow-right-from-bracket"}`} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
