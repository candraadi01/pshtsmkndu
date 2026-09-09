"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/services/auth";

interface AdminSidebarProps {
  role: AdminRole;
  displayName: string;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Exclude shell on login page
  if (pathname === "/admin/login") return null;

  const navigation =
    role === "super_admin"
      ? [
          { name: "Dashboard", href: "/admin", icon: "fa-solid fa-chart-line" },
          { name: "Artikel & Berita", href: "/admin/artikel", icon: "fa-solid fa-newspaper" },
          { name: "Pengumuman", href: "/admin/pengumuman", icon: "fa-solid fa-bullhorn" },
          { name: "Pelatih, Warga & Siswa", href: "/admin/people", icon: "fa-solid fa-users" },
          { name: "Galeri Foto", href: "/admin/galeri", icon: "fa-solid fa-images" },
          { name: "Dokumen Unduhan", href: "/admin/dokumen", icon: "fa-solid fa-file-pdf" },
          { name: "Ekstrakurikuler", href: "/admin/ekstrakurikuler", icon: "fa-solid fa-award" },
          { name: "Log Aktivitas Admin", href: "/admin/audit-logs", icon: "fa-solid fa-clock-rotate-left" },
          { name: "Kelola Admin", href: "/admin/users", icon: "fa-solid fa-user-shield" },
          { name: "Pengaturan & Logo", href: "/admin/settings", icon: "fa-solid fa-sliders" },
        ]
      : [
          { name: "Dashboard", href: "/admin", icon: "fa-solid fa-chart-line" },
          { name: "Artikel & Berita", href: "/admin/artikel", icon: "fa-solid fa-newspaper" },
          { name: "Data Siswa", href: "/admin/people", icon: "fa-solid fa-user-graduate" },
        ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111827] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-black/50 rounded-xl border border-amber-500/30">
              <Image
                src="/sh-emblem.png"
                alt="Logo PSHT SMKNDU"
                width={40}
                height={40}
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">PANEL ADMIN</div>
              <div className="text-[10px] text-gray-400 font-medium tracking-tight">PSHT SMKN DARUL ULUM</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </div>
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                <i className={`${item.icon} text-sm w-5 text-center ${isActive ? "text-gray-950" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0d131f]">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800/70 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium border border-gray-700/60 transition-colors"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-amber-400" />
            <span>Lihat Website</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar with Hamburger Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-gray-800 sticky top-0 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white focus:outline-none"
          aria-label="Buka Menu"
        >
          <i className="fa-solid fa-bars text-base" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/sh-emblem.png" alt="Logo" width={28} height={28} className="w-7 h-7 object-contain" />
          <span className="text-xs font-bold text-white tracking-wider">PANEL ADMIN</span>
        </div>
        <div className="w-8" />
      </div>
    </>
  );
}
