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

interface NavItem {
  name: string;
  href: string;
  icon: string;
  color: string;
  bgColor: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminSidebar({ role, displayName }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Exclude shell on login page
  if (pathname === "/admin/login") return null;

  const sections: NavSection[] =
    role === "super_admin"
      ? [
          {
            title: "Utama",
            items: [
              {
                name: "Dashboard Live",
                href: "/admin",
                icon: "fa-solid fa-chart-pie",
                color: "text-blue-600",
                bgColor: "bg-blue-50 border-blue-200/80",
              },
            ],
          },
          {
            title: "Konten & Publikasi",
            items: [
              {
                name: "Artikel & Berita",
                href: "/admin/artikel",
                icon: "fa-solid fa-newspaper",
                color: "text-amber-600",
                bgColor: "bg-amber-50 border-amber-200/80",
              },
              {
                name: "Pengumuman",
                href: "/admin/pengumuman",
                icon: "fa-solid fa-bullhorn",
                color: "text-rose-500",
                bgColor: "bg-rose-50 border-rose-200/80",
              },
              {
                name: "Galeri Foto",
                href: "/admin/galeri",
                icon: "fa-solid fa-images",
                color: "text-purple-600",
                bgColor: "bg-purple-50 border-purple-200/80",
              },
              {
                name: "Dokumen Unduhan",
                href: "/admin/dokumen",
                icon: "fa-solid fa-file-pdf",
                color: "text-emerald-600",
                bgColor: "bg-emerald-50 border-emerald-200/80",
              },
            ],
          },
          {
            title: "Keanggotaan & Data",
            items: [
              {
                name: "Pelatih, Warga & Siswa",
                href: "/admin/people",
                icon: "fa-solid fa-users",
                color: "text-indigo-600",
                bgColor: "bg-indigo-50 border-indigo-200/80",
              },
              {
                name: "Ekstrakurikuler",
                href: "/admin/ekstrakurikuler",
                icon: "fa-solid fa-award",
                color: "text-teal-600",
                bgColor: "bg-teal-50 border-teal-200/80",
              },
            ],
          },
          {
            title: "Sistem & Keamanan",
            items: [
              {
                name: "Log Aktivitas Admin",
                href: "/admin/audit-logs",
                icon: "fa-solid fa-clock-rotate-left",
                color: "text-violet-600",
                bgColor: "bg-violet-50 border-violet-200/80",
                badge: "Live",
                badgeColor: "bg-emerald-500 text-white",
              },
              {
                name: "Kelola Admin",
                href: "/admin/users",
                icon: "fa-solid fa-user-shield",
                color: "text-orange-500",
                bgColor: "bg-orange-50 border-orange-200/80",
              },
              {
                name: "Pengaturan & Logo",
                href: "/admin/settings",
                icon: "fa-solid fa-sliders",
                color: "text-slate-600",
                bgColor: "bg-slate-100 border-slate-200/80",
              },
            ],
          },
        ]
      : [
          {
            title: "Utama",
            items: [
              {
                name: "Dashboard",
                href: "/admin",
                icon: "fa-solid fa-chart-pie",
                color: "text-blue-600",
                bgColor: "bg-blue-50 border-blue-200/80",
              },
            ],
          },
          {
            title: "Tugas Operasional",
            items: [
              {
                name: "Artikel & Berita",
                href: "/admin/artikel",
                icon: "fa-solid fa-newspaper",
                color: "text-amber-600",
                bgColor: "bg-amber-50 border-amber-200/80",
              },
              {
                name: "Data Siswa",
                href: "/admin/people",
                icon: "fa-solid fa-user-graduate",
                color: "text-indigo-600",
                bgColor: "bg-indigo-50 border-indigo-200/80",
              },
            ],
          },
        ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out shadow-sm ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/sh-emblem.png"
                alt="Logo PSHT SMKNDU"
                width={32}
                height={32}
                className="w-7 h-7 object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>PANEL ADMIN</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-500 font-bold tracking-tight">PSHT SMKN DARUL ULUM</div>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>



        {/* Navigation Links with Colorful Accents */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center justify-between">
                <span>{section.title}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
              </div>

              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/25 translate-x-0.5"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 transition-transform group-hover:scale-110 border ${
                          isActive
                            ? "bg-white/20 text-white border-white/25 shadow-inner"
                            : `${item.bgColor} ${item.color}`
                        }`}
                      >
                        <i className={item.icon} />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 ${
                          isActive
                            ? "bg-white text-indigo-700 font-black"
                            : item.badgeColor || "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions with Gradient Visit Button */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-bold shadow-sm shadow-slate-950/20 transition-all hover:shadow"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-amber-400" />
            <span>Kunjungi Website Publik</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar with Hamburger Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 focus:outline-none"
          aria-label="Buka Menu"
        >
          <i className="fa-solid fa-bars text-base" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/sh-emblem.png" alt="Logo" width={28} height={28} className="w-7 h-7 object-contain" />
          <span className="text-xs font-black text-slate-900 tracking-wider">PANEL ADMIN</span>
        </div>
        <div className="w-8" />
      </div>
    </>
  );
}
