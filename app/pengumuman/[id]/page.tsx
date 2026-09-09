import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { resolveMediaUrl } from "@/lib/media";
import { getAnnouncementById } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    return {
      title: "Pengumuman Tidak Ditemukan - PSHT SMKN Darul Ulum Muncar",
    };
  }

  return {
    title: `${announcement.judul} - Pengumuman PSHT SMKN Darul Ulum Muncar`,
    description: announcement.isi.slice(0, 160),
  };
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `(${bytes} B)`;
  if (bytes < 1024 * 1024) return `(${(bytes / 1024).toFixed(1)} KB)`;
  return `(${(bytes / (1024 * 1024)).toFixed(1)} MB)`;
}

export default async function PengumumanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  const attachments = announcement.attachments ?? [];
  const hasAttachments = attachments.length > 0;
  const hasLegacyLampiran = Boolean(announcement.lampiran);
  const totalAttachmentCount = attachments.length + (hasLegacyLampiran && !attachments.some((a) => a.secure_url === announcement.lampiran) ? 1 : 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader />

      <div className="border-b border-gray-200 bg-neutral-100 py-3 text-xs text-gray-600">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4">
          <a href="/" className="hover:text-black">Beranda</a>
          <span>/</span>
          <a href="/pengumuman" className="hover:text-black">Pengumuman</a>
          <span>/</span>
          <span className="truncate font-medium text-black">{announcement.judul}</span>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <i className="fa-regular fa-calendar text-[11px] text-black" />
              {announcement.created_at_formatted || "Terbaru"}
            </span>
            {totalAttachmentCount > 0 && (
              <span className="text-xs font-medium text-gray-500">
                <i className="fa-solid fa-paperclip mr-1" />{" "}
                {totalAttachmentCount > 1
                  ? `${totalAttachmentCount} Lampiran Tersedia`
                  : "Memiliki Lampiran"}
              </span>
            )}
          </div>

          <h1 className="mb-6 text-2xl font-extrabold leading-tight text-gray-900 md:text-3xl lg:text-4xl">
            {announcement.judul}
          </h1>

          <div className="whitespace-pre-line text-base leading-relaxed text-gray-800 md:text-lg">
            {announcement.isi}
          </div>

          {/* Section Lampiran Banyak (Multi-Attachments) */}
          {hasAttachments && (
            <div id="lampiran" className="mt-10 rounded-2xl border border-gray-200 bg-neutral-50 p-6">
              <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <i className="fa-solid fa-paperclip text-black" />
                  Berkas Lampiran ({attachments.length})
                </h3>
                <span className="text-xs text-gray-500">Tersedia untuk dilihat dan diunduh</span>
              </div>

              <div className="flex flex-col gap-5">
                {attachments.map((att) => {
                  const mediaUrl = resolveMediaUrl(att.secure_url);
                  const sizeLabel = formatFileSize(att.bytes);

                  if (att.asset_type === "image") {
                    return (
                      <div
                        key={att.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                            <i className="fa-regular fa-image text-black" /> {att.label}
                          </span>
                          {sizeLabel && <span className="text-xs text-gray-500">{sizeLabel}</span>}
                        </div>
                        <div className="overflow-hidden rounded-lg bg-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl}
                            alt={att.label}
                            className="max-h-96 w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3 flex justify-end">
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" /> Buka Gambar Lengkap
                          </a>
                        </div>
                      </div>
                    );
                  }

                  if (att.asset_type === "video") {
                    return (
                      <div
                        key={att.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                            <i className="fa-solid fa-video text-black" /> {att.label}
                          </span>
                          {sizeLabel && <span className="text-xs text-gray-500">{sizeLabel}</span>}
                        </div>
                        <video
                          controls
                          src={mediaUrl}
                          className="max-h-96 w-full rounded-lg bg-black"
                          preload="metadata"
                        >
                          Browser Anda tidak mendukung pemutar video.
                        </video>
                        <div className="mt-3 flex justify-end">
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                          >
                            <i className="fa-solid fa-file-arrow-down text-[10px]" /> Unduh Video
                          </a>
                        </div>
                      </div>
                    );
                  }

                  if (att.asset_type === "audio") {
                    return (
                      <div
                        key={att.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                            <i className="fa-solid fa-volume-high text-black" /> {att.label}
                          </span>
                          {sizeLabel && <span className="text-xs text-gray-500">{sizeLabel}</span>}
                        </div>
                        <audio controls src={mediaUrl} className="mt-2 w-full" preload="metadata">
                          Browser Anda tidak mendukung pemutar audio.
                        </audio>
                        <div className="mt-3 flex justify-end">
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                          >
                            <i className="fa-solid fa-file-arrow-down text-[10px]" /> Unduh Audio
                          </a>
                        </div>
                      </div>
                    );
                  }

                  // Default: Document / Other
                  return (
                    <div
                      key={att.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-black">
                          <i className="fa-regular fa-file-pdf text-lg" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{att.label}</p>
                          <p className="text-xs text-gray-500">
                            Format: {att.format?.toUpperCase() || "Dokumen"} {sizeLabel}
                          </p>
                        </div>
                      </div>
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                      >
                        <i className="fa-solid fa-file-arrow-down" /> Lihat / Unduh
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lampiran Legacy (Jika ada dan belum tercakup di attachments) */}
          {hasLegacyLampiran && !attachments.some((a) => a.secure_url === announcement.lampiran) && (
            <div className="mt-8 rounded-xl border border-gray-200 bg-neutral-50 p-4">
              <h3 className="mb-2 text-sm font-bold text-gray-900">Lampiran Dokumen Tambahan</h3>
              <a
                href={resolveMediaUrl(announcement.lampiran)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
              >
                <i className="fa-solid fa-file-arrow-down" /> Unduh Dokumen Lampiran
              </a>
            </div>
          )}

          <div className="mt-10 border-t border-gray-200 pt-6">
            <a
              href="/pengumuman"
              className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              <i className="fa-solid fa-arrow-left text-xs" /> Kembali ke Daftar Pengumuman
            </a>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

