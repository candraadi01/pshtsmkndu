"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/media";
import type { GalleryImage } from "@/types/content";

interface GalleryLightboxProps {
  images: GalleryImage[];
  galleryName: string;
}

function sanitizeFilename(name: string, fallback: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return (clean || fallback) + ".jpg";
}

async function triggerImageDownload(url: string, filename: string) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Gagal mengunduh gambar");
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
  } catch {
    // Fallback if CORS prevents blob creation
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export default function GalleryLightbox({ images, galleryName }: GalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<number | null>(null);

  const activeImage = selectedIndex !== null ? images[selectedIndex] : null;

  function closeModal() {
    setSelectedIndex(null);
  }

  function prevImage() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  }

  function nextImage() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  }

  async function handleDownload(img: GalleryImage, index: number, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation();
    }
    const imgUrl = resolveMediaUrl(img.path);
    const filename = sanitizeFilename(
      `${galleryName}-${img.caption || `foto-${index + 1}`}`,
      `psht-galeri-${img.id}`
    );

    setDownloadingId(img.id);
    try {
      await triggerImageDownload(imgUrl, filename);
      setDownloadSuccessId(img.id);
      setTimeout(() => {
        setDownloadSuccessId((current) => (current === img.id ? null : current));
      }, 2500);
    } finally {
      setDownloadingId(null);
    }
  }

  useEffect(() => {
    if (selectedIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500">
        Belum ada foto dalam album ini.
      </div>
    );
  }

  return (
    <div>
      {/* Grid Foto */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img, idx) => {
          const imgUrl = resolveMediaUrl(img.path);
          const captionText = img.caption || `${galleryName} - Foto ${idx + 1}`;
          const isDownloading = downloadingId === img.id;
          const isSuccess = downloadSuccessId === img.id;

          return (
            <div
              key={img.id}
              className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-neutral-100 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Tombol Buka Modal Lightbox */}
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="relative h-full w-full text-left focus:outline-none focus:ring-2 focus:ring-black"
                aria-label={`Buka foto: ${captionText}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={captionText}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 pr-12 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="line-clamp-2 text-xs font-medium leading-snug">{captionText}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/75">
                    <i className="fa-solid fa-magnifying-glass-plus" /> Klik untuk memperbesar
                  </span>
                </div>
              </button>

              {/* Tombol Download Cepat di Pojok Kanan Atas Foto */}
              <button
                type="button"
                onClick={(e) => handleDownload(img, idx, e)}
                disabled={isDownloading}
                className="absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black active:scale-95 shadow-md border border-white/20 disabled:opacity-75"
                title={isSuccess ? "Berhasil diunduh" : "Download foto"}
                aria-label={`Download foto: ${captionText}`}
              >
                {isDownloading ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                ) : isSuccess ? (
                  <i className="fa-solid fa-check text-green-400 text-xs" />
                ) : (
                  <i className="fa-solid fa-download text-xs" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-all"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Penampil Foto"
        >
          {/* Action Header di Atas Modal (Download + Tutup) */}
          <div className="absolute right-4 top-4 z-50 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => handleDownload(activeImage, selectedIndex, e)}
              disabled={downloadingId === activeImage.id}
              className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white hover:text-black border border-white/30 shadow-lg active:scale-95 disabled:opacity-75"
              aria-label="Download foto ini"
            >
              {downloadingId === activeImage.id ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" />
                  <span>Mengunduh...</span>
                </>
              ) : downloadSuccessId === activeImage.id ? (
                <>
                  <i className="fa-solid fa-check text-green-400" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-download" />
                  <span>Download Foto</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black border border-white/30 shadow-lg"
              aria-label="Tutup penampil foto"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          {/* Tombol Navigasi Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-black focus:outline-none"
              aria-label="Foto sebelumnya"
            >
              <i className="fa-solid fa-chevron-left text-base" />
            </button>
          )}

          {/* Konten Gambar & Caption */}
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveMediaUrl(activeImage.path)}
              alt={activeImage.caption || galleryName}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl w-full px-4 text-white text-center sm:text-left">
              <div>
                <p className="text-sm font-medium leading-relaxed md:text-base">
                  {activeImage.caption || galleryName}
                </p>
                <div className="mt-1 text-xs text-white/60">
                  {galleryName} • Foto {selectedIndex + 1} dari {images.length}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDownload(activeImage, selectedIndex, e)}
                disabled={downloadingId === activeImage.id}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white hover:text-black px-3.5 py-1.5 text-xs font-medium text-white transition backdrop-blur-sm border border-white/20 active:scale-95 disabled:opacity-75"
              >
                <i className="fa-solid fa-arrow-down-to-bracket text-xs" /> Unduh Ukuran Asli
              </button>
            </div>
          </div>

          {/* Tombol Navigasi Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-black focus:outline-none"
              aria-label="Foto berikutnya"
            >
              <i className="fa-solid fa-chevron-right text-base" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
