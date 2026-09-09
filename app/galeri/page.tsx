import type { Metadata } from "next";
import Link from "next/link";
import GalleryLightbox from "@/components/gallery-lightbox";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getGalleries } from "@/lib/services/galeri";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Galeri Foto - PSHT SMKN Darul Ulum Muncar",
    description:
      "Dokumentasi visual kegiatan latihan, ujian kenaikan tingkat, dan bakti sosial Persaudaraan Setia Hati Terate di SMKN Darul Ulum Muncar.",
  };
}

export default async function GaleriPage() {
  const galleries = await getGalleries();

  const totalPhotos = galleries.reduce((acc, g) => acc + (g.images?.length ?? 0), 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader />

      {/* Hero Header */}
      <section className="border-b-4 border-black bg-black py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Dokumentasi Visual
          </span>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Galeri Foto</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Momen kebersamaan, dedikasi latihan fisik dan spiritual, serta kegiatan pengabdian masyarakat warga dan siswa
            PSHT Rayon SMKN Darul Ulum Muncar.
          </p>
        </div>
      </section>

      {/* Breadcrumb & Sub-Info */}
      <div className="border-b border-gray-200 bg-neutral-100 py-3 text-xs text-gray-600">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-black">
              Beranda
            </Link>
            <span>/</span>
            <span className="font-medium text-black">Galeri</span>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
              <i className="fa-regular fa-folder-open text-black" /> {galleries.length} Album
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
              <i className="fa-regular fa-images text-black" /> {totalPhotos} Foto
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-[60vh] bg-neutral-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {galleries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
              <i className="fa-regular fa-images mb-3 text-4xl text-gray-400" />
              <p className="text-base font-medium">Belum ada album galeri yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {galleries.map((gallery) => (
                <section
                  key={gallery.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
                >
                  {/* Header Tiap Galeri */}
                  <div className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{gallery.nama_galeri}</h2>
                      {gallery.deskripsi && (
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{gallery.deskripsi}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <i className="fa-regular fa-image text-black" /> {gallery.images.length} Foto
                      </span>
                      {gallery.created_at_formatted && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          <i className="fa-regular fa-calendar text-[11px] text-black" /> {gallery.created_at_formatted}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grid Foto dengan Lightbox Interaktif */}
                  <GalleryLightbox images={gallery.images} galleryName={gallery.nama_galeri} />
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
