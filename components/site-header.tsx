"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const menuGroups = [
  {
    label: "Media",
    items: [
      ["Artikel", "/artikel"],
      ["Pengumuman", "/pengumuman"],
      ["Galeri", "/galeri"],
    ],
  },
  {
    label: "Profil",
    items: [
      ["Struktur Organisasi", "/struktur-organisasi"],
      ["Siswa Aktif", "/siswa"],
      ["Warga", "/warga"],
      ["Pelatih", "/pelatih"],
      ["Ekstrakurikuler", "/ekstrakurikuler"],
    ],
  },
  {
    label: "Unduh",
    items: [
      ["Surat Izin Orang Tua", "/dokumen/1"],
      ["Lain-lain", "/dokumen/2"],
    ],
  },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      window.location.href = `/artikel?q=${encodeURIComponent(trimmed)}`;
    }
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
    if (menuOpen) {
      setOpenDropdown(null);
    }
  }

  function toggleMobileDropdown(name: string) {
    setOpenDropdown(openDropdown === name ? null : name);
  }

  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo (shifted slightly right) */}
            <div className="flex-shrink-0 flex items-center pl-2 sm:pl-3">
              <Link href="/" aria-label="Beranda PSHT" className="flex items-center py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-8 sm:h-[34px] w-auto object-contain"
                  src="/storage/psht-logo-full.png"
                  alt="Logo PSHT TERATE SMKNDU"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3 xl:space-x-4">
              <Link
                href="/"
                className="text-white hover:text-gray-300 text-sm font-medium px-3 py-2 transition-colors"
              >
                Beranda
              </Link>

              {menuGroups.map((group) => (
                <div key={group.label} className="relative group">
                  <button
                    type="button"
                    className="text-white hover:text-gray-300 text-sm font-medium px-3 py-2 flex items-center transition-colors"
                  >
                    <span>{group.label}</span>
                    <svg
                      className="w-3.5 h-3.5 ml-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className="absolute left-0 w-full h-2 invisible"></div>
                  <div
                    className="absolute left-0 top-full min-w-[175px] z-40 bg-zinc-900 border border-zinc-800 text-white rounded-md shadow-xl py-1.5
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                transition-all duration-200"
                  >
                    {group.items.map(([label, href]) => (
                      <Link
                        key={href}
                        href={href}
                        className="block px-4 py-2 text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <Link
                href="/kontak"
                className="text-white hover:text-gray-300 text-sm font-medium px-3 py-2 transition-colors"
              >
                Kontak
              </Link>

              <Link
                href="/registrasi"
                className="text-white bg-[#4a5568] hover:bg-[#374151] text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm ml-1"
              >
                Registrasi
              </Link>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden lg:block w-48 xl:w-56 relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder="Cari..."
                className="w-full h-8 sm:h-9 py-1.5 pl-8 pr-3 rounded-md sm:rounded-lg bg-white text-xs sm:text-sm border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 text-black shadow-sm"
              />
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </div>
            </form>

            {/* Mobile Menu Button - Comfortable touch target */}
            <div className="lg:hidden flex items-center pr-1">
              <button
                onClick={toggleMenu}
                className="text-white hover:text-gray-300 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition-all"
                aria-label="Toggle Mobile Menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {!menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden w-full left-0 bg-black/95 backdrop-blur-md text-white shadow-2xl absolute overflow-visible z-50 border-t border-zinc-800 py-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-gray-600"
              >
                Beranda
              </Link>

              {menuGroups.map((group) => {
                const isGroupOpen = openDropdown === group.label.toLowerCase();
                return (
                  <div key={group.label} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleMobileDropdown(group.label.toLowerCase())}
                      className="w-full text-left px-4 py-2 hover:bg-gray-600 flex justify-between items-center"
                    >
                      <span>{group.label}</span>
                      <svg
                        className="w-4 h-4 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={isGroupOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                        />
                      </svg>
                    </button>
                    {isGroupOpen && (
                      <div className="pl-4 bg-gray-800">
                        {group.items.map(([label, href]) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 hover:bg-gray-700"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/kontak"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Kontak
              </Link>
              <Link
                href="/registrasi"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-2.5 text-sm font-medium text-amber-400 hover:bg-zinc-800 transition-colors"
              >
                Registrasi
              </Link>

              {/* Mobile Search */}
              <div className="px-5 py-3 pb-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="search"
                    placeholder="Cari..."
                    className="w-full h-9 py-1.5 pl-8 pr-3 rounded-lg bg-white text-xs sm:text-sm border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 text-black shadow-sm"
                  />
                  <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                      />
                    </svg>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16"></div>
    </header>
  );
}
