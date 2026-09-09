"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { DokumenItem, TipeDokumen } from "@/types/content";

interface DokumenViewProps {
  currentDokumen: TipeDokumen;
  allTipeDokumen: TipeDokumen[];
}

export default function DokumenView({ currentDokumen, allTipeDokumen }: DokumenViewProps) {
  const [selectedDocument, setSelectedDocument] = useState<DokumenItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const confirmDownload = (dokumen: DokumenItem) => {
    setSelectedDocument(dokumen);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
  };

  const handleDownload = () => {
    if (!selectedDocument) return;

    const fileUrl = resolveMediaUrl(selectedDocument.path);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = selectedDocument.nama_dokumen + ".pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closeModal();
  };

  return (
    <div className="w-full lg:w-2/3 bg-white rounded-2xl py-8 px-6 md:px-8 shadow-2xl">
      {/* Category Tabs if more than 1 */}
      {allTipeDokumen.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-4">
          {allTipeDokumen.map((cat) => {
            const isActive = cat.id === currentDokumen.id;
            return (
              <Link
                key={cat.id}
                href={`/dokumen/${cat.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gray-800 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.nama}
              </Link>
            );
          })}
        </div>
      )}

      {/* Title */}
      <div className="border-l-4 border-gray-600 pl-4 mb-6">
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          {currentDokumen.nama}
        </h1>
        <p className="text-gray-500 mt-1 text-xs md:text-sm">
          Informasi dan berkas resmi Persaudaraan Setia Hati Terate
        </p>
      </div>

      {/* Deskripsi (HTML / Google Forms iframe) */}
      {currentDokumen.deskripsi && (
        <div className="prose max-w-none text-gray-600 mt-4 leading-relaxed">
          <div
            className="iframe-wrapper w-full overflow-hidden rounded-xl"
            dangerouslySetInnerHTML={{ __html: currentDokumen.deskripsi }}
          />
        </div>
      )}

      {/* List Dokumen */}
      {currentDokumen.dokumen && currentDokumen.dokumen.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDokumen.dokumen.map((dokumen) => (
            <div
              key={dokumen.id}
              className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center mb-3">
                  <i className="fa-regular fa-file-lines text-xl" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                  {dokumen.nama_dokumen}
                </h2>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                {/* Tombol Lihat */}
                <a
                  href={resolveMediaUrl(dokumen.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-semibold transition"
                >
                  <i className="fa-regular fa-eye mr-1" /> Lihat
                </a>

                {/* Tombol Unduh dengan Konfirmasi */}
                <button
                  type="button"
                  onClick={() => confirmDownload(dokumen)}
                  className="flex-1 text-center py-2 px-3 bg-gray-700 text-white rounded-lg hover:bg-gray-900 text-xs font-semibold transition shadow-sm"
                >
                  <i className="fa-solid fa-download mr-1" /> Unduh
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !currentDokumen.deskripsi?.includes("<iframe") && (
          <p className="text-gray-500 mt-6 text-sm">
            Belum ada berkas dokumen yang diunggah untuk kategori ini.
          </p>
        )
      )}

      {/* Modal Konfirmasi Unduhan */}
      {showModal && selectedDocument && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 transform transition-all"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-download text-xl" />
            </div>

            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Konfirmasi Unduhan
            </h3>

            <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengunduh dokumen{" "}
              <strong className="text-black font-semibold">
                &ldquo;{selectedDocument.nama_dokumen}&rdquo;
              </strong>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm font-semibold rounded-lg shadow-md transition"
              >
                Ya, Unduh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
