import type { Metadata } from "next";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { resolveMediaUrl } from "@/lib/media";
import { sanitizeHtml } from "@/lib/sanitize";
import { getExtracurriculars } from "@/lib/services/ekstrakurikuler";

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    title: "Ekstrakurikuler - PSHT SMKN Darul Ulum Muncar",
    description:
      "Daftar kegiatan ekstrakurikuler resmi di SMKN Darul Ulum Muncar, wadah pengembangan bakat, pembentukan karakter, bela diri, dan kepemimpinan siswa.",
  };
}

export default async function EkstrakurikulerPage() {
  const extracurriculars = await getExtracurriculars();

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader />

      {/* Hero Header */}
      <section className="border-b-4 border-black bg-black py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Kegiatan Siswa
          </span>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Ekstrakurikuler</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Wadah pengembangan bakat seni beladiri pencak silat, olah fisik dan rohani, pembentukan budi pekerti luhur,
            serta kepemimpinan siswa di SMKN Darul Ulum Muncar.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-neutral-100 py-3 text-xs text-gray-600">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4">
          <a href="/" className="hover:text-black">
            Beranda
          </a>
          <span>/</span>
          <span className="font-medium text-black">Ekstrakurikuler</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-[60vh] bg-neutral-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {extracurriculars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
              <i className="fa-solid fa-shapes mb-3 text-4xl text-gray-400" />
              <p className="text-base font-medium">Belum ada data ekstrakurikuler yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {extracurriculars.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Foto Ekstrakurikuler */}
                  <a
                    href={`/ekstrakurikuler/${item.id}`}
                    className="relative aspect-video w-full overflow-hidden bg-neutral-100 block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveMediaUrl(item.gambar)}
                      alt={item.nama}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      Ekstrakurikuler
                    </span>
                  </a>

                  {/* Isi Konten */}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900">
                      <a href={`/ekstrakurikuler/${item.id}`} className="hover:underline">
                        {item.nama}
                      </a>
                    </h2>

                    {item.deskripsi && (
                      <div
                        className="mb-6 flex-1 text-sm leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.deskripsi) }}
                      />
                    )}

                    {/* Meta Informasi Terjadwal & Penanggung Jawab */}
                    <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs text-gray-700">
                      {item.jadwal && (
                        <div className="flex items-start gap-2.5">
                          <i className="fa-regular fa-clock mt-0.5 shrink-0 text-gray-900" />
                          <div>
                            <span className="font-semibold text-gray-900">Jadwal:</span> {item.jadwal}
                          </div>
                        </div>
                      )}

                      {item.lokasi && (
                        <div className="flex items-start gap-2.5">
                          <i className="fa-solid fa-location-dot mt-0.5 shrink-0 text-gray-900" />
                          <div>
                            <span className="font-semibold text-gray-900">Lokasi:</span> {item.lokasi}
                          </div>
                        </div>
                      )}

                      {item.nama_pembina && (
                        <div className="flex items-start gap-2.5">
                          <i className="fa-solid fa-user-tie mt-0.5 shrink-0 text-gray-900" />
                          <div>
                            <span className="font-semibold text-gray-900">Pembina:</span> {item.nama_pembina}
                          </div>
                        </div>
                      )}

                      {item.nama_ketua && (
                        <div className="flex items-start gap-2.5">
                          <i className="fa-solid fa-user-shield mt-0.5 shrink-0 text-gray-900" />
                          <div>
                            <span className="font-semibold text-gray-900">Ketua:</span> {item.nama_ketua}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4 flex justify-end">
                      <a
                        href={`/ekstrakurikuler/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                      >
                        Lihat Detail <i className="fa-solid fa-arrow-right text-[10px]" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Banner Pendaftaran / Kontak Info */}
          <div className="mt-14 rounded-2xl border border-black bg-black p-8 text-center text-white md:p-10">
            <h3 className="text-xl font-bold md:text-2xl">Tertarik Bergabung dengan Ekstrakurikuler?</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/75 md:text-base">
              Kembangkan potensi diri, bina kedisiplinan, dan jalin persaudaraan yang erat. Hubungi kami atau lakukan
              registrasi anggota baru.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/registrasi"
                className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                <i className="fa-solid fa-user-plus text-xs" /> Registrasi Anggota
              </a>
              <a
                href="/kontak"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                <i className="fa-solid fa-phone text-xs" /> Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
