import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { resolveMediaUrl } from "@/lib/media";
import { sanitizeHtml } from "@/lib/sanitize";
import { getExtracurricularById } from "@/lib/services/ekstrakurikuler";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getExtracurricularById(id);

  if (!item) {
    return {
      title: "Ekstrakurikuler Tidak Ditemukan - PSHT SMKN Darul Ulum Muncar",
    };
  }

  return {
    title: `${item.nama} - Ekstrakurikuler PSHT SMKN Darul Ulum Muncar`,
    description: item.deskripsi?.slice(0, 160) ?? `Detail kegiatan ekstrakurikuler ${item.nama}`,
  };
}

export default async function EkstrakurikulerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getExtracurricularById(id);

  if (!item) {
    notFound();
  }

  const imageUrl = resolveMediaUrl(item.gambar);

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-neutral-100 py-3 text-xs text-gray-600">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4">
          <a href="/" className="hover:text-black">
            Beranda
          </a>
          <span>/</span>
          <a href="/ekstrakurikuler" className="hover:text-black">
            Ekstrakurikuler
          </a>
          <span>/</span>
          <span className="truncate font-medium text-black">{item.nama}</span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          {/* Cover Gambar */}
          <div className="relative aspect-[21/9] w-full min-h-[220px] overflow-hidden bg-neutral-900 md:min-h-[340px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={item.nama}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8 md:right-8">
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                Kegiatan Resmi
              </span>
              <h1 className="text-2xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
                {item.nama}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Grid Informasi Detail (Jadwal, Lokasi, Pembina, Ketua) */}
            <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-neutral-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                  <i className="fa-regular fa-clock" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Jadwal Latihan</div>
                  <div className="text-sm font-bold text-gray-900">{item.jadwal || "Sesuai Pengumuman"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Lokasi</div>
                  <div className="text-sm font-bold text-gray-900">{item.lokasi || "Lingkungan Sekolah"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                  <i className="fa-solid fa-user-tie" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pembina</div>
                  <div className="text-sm font-bold text-gray-900">{item.nama_pembina || "-"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                  <i className="fa-solid fa-user-shield" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ketua Ekstrakurikuler</div>
                  <div className="text-sm font-bold text-gray-900">{item.nama_ketua || "-"}</div>
                </div>
              </div>
            </div>

            {/* Deskripsi Lengkap */}
            <div className="mb-10 border-b border-gray-100 pb-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Tentang Kegiatan</h2>
              {item.deskripsi ? (
                <div
                  className="prose max-w-none text-base leading-relaxed text-gray-800 md:text-lg"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.deskripsi) }}
                />
              ) : (
                <p className="text-gray-500 italic">Belum ada deskripsi detail untuk ekstrakurikuler ini.</p>
              )}
            </div>

            {/* Aksi & Navigasi */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <a
                href="/ekstrakurikuler"
                className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                <i className="fa-solid fa-arrow-left text-xs" /> Kembali ke Daftar Ekstrakurikuler
              </a>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/kontak"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-black hover:text-black"
                >
                  <i className="fa-solid fa-circle-question text-xs" /> Tanya Pembina
                </a>
                <a
                  href="/registrasi"
                  className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  <i className="fa-solid fa-user-plus text-xs" /> Gabung Sekarang
                </a>
              </div>
            </div>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
