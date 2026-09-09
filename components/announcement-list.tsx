"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatIndonesianDate } from "@/lib/date";
import { resolveMediaUrl } from "@/lib/media";
import type { Pengumuman } from "@/types/content";

interface AnnouncementListProps {
  announcements: Pengumuman[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function AnnouncementList({ announcements }: AnnouncementListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return announcements.slice(start, start + itemsPerPage);
  }, [announcements, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full lg:w-2/3">
      {/* Title with Gray Bar */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-gray-600 mr-3"></div>
        <h1 className="text-2xl font-bold text-gray-800">Pengumuman Terbaru</h1>
      </div>

      {/* Empty State */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-600 font-medium">Tidak ada pengumuman yang tersedia saat ini.</p>
        </div>
      ) : (
        /* Announcement Cards */
        <div className="space-y-5">
          {paginatedAnnouncements.map((pengumuman) => (
            <div
              key={pengumuman.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border-l-4 border-gray-500"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-gray-600 transition leading-snug">
                  <Link href={`/pengumuman/${pengumuman.id}`}>{pengumuman.judul}</Link>
                </h2>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{pengumuman.created_at_formatted || formatIndonesianDate(pengumuman.created_at)}</span>

                  {pengumuman.lampiran && (
                    <span className="ml-4 inline-flex items-center text-xs text-gray-500">
                      <i className="fa-solid fa-paperclip mr-1" /> Lampiran
                    </span>
                  )}
                </div>

                <div className="text-gray-600 line-clamp-3 mb-4 text-sm leading-relaxed whitespace-pre-line">
                  {stripHtml(pengumuman.isi)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Link
                    href={`/pengumuman/${pengumuman.id}`}
                    className="inline-flex items-center text-gray-600 font-medium hover:text-gray-800 transition text-sm group"
                  >
                    <span>Baca selengkapnya</span>
                    <svg
                      className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  {pengumuman.lampiran && (
                    <a
                      href={resolveMediaUrl(pengumuman.lampiran)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black border border-gray-300 rounded-full px-3 py-1 transition hover:border-black"
                    >
                      <i className="fa-solid fa-file-arrow-down" /> Unduh Lampiran
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Halaman sebelumnya"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === page
                      ? "bg-gray-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Halaman berikutnya"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
