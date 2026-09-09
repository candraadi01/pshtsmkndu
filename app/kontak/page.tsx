import type { Metadata } from "next";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/services/artikel";
import { getAnnouncements } from "@/lib/services/pengumuman";
import { getSiteExtendedSettings } from "@/lib/services/site-settings-server";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Kontak - PSHT SMKN Darul Ulum Muncar",
    description:
      "Hubungi pengurus dan pelatih PSHT Rayon SMKN Darul Ulum Muncar. Informasi lokasi latihan, WhatsApp, dan media sosial resmi.",
  };
}

export default async function KontakPage() {
  const ext = getSiteExtendedSettings();

  const [popularArticles, announcements] = await Promise.all([
    getArticles({ limit: 5 }),
    getAnnouncements(4),
  ]);

  const rawWa = ext.whatsapp || "6282338184217";
  const waNumber = rawWa.replace(/\D/g, "");
  const waChatUrl = rawWa.startsWith("http") 
    ? rawWa 
    : `https://wa.me/${waNumber}?text=Halo%20Pengurus%20PSHT%20SMKN%20Darul%20Ulum%20Muncar%2C%20saya%20ingin%20bertanya%20informasi...`;

  const rawIg = ext.instagram || "https://instagram.com/psht.smkndu";
  const igHandle = rawIg.includes("instagram.com/") 
    ? "@" + rawIg.split("instagram.com/")[1]?.replace(/\/.*$/, "") 
    : rawIg.startsWith("@") ? rawIg : `@${rawIg}`;
  const igUrl = rawIg.startsWith("http") ? rawIg : `https://instagram.com/${rawIg.replace(/^@/, "")}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-black">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          {/* Main Content Dark Card */}
          <div className="w-full lg:w-[65%] bg-[#1e242d] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-gray-700/80 flex flex-col justify-between">
            <div>
              {/* Judul Kontak */}
              <div className="border-l-4 border-amber-500 pl-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Hubungi Kami
                </h1>
                <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                  Sekretariat &amp; Lokasi Latihan PSHT Rayon SMKN Darul Ulum Muncar
                </p>
              </div>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <a
                  href={waChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  <i className="fab fa-whatsapp text-lg" />
                  <span>Chat WhatsApp Langsung</span>
                </a>
                <a
                  href={ext.maps_link || "https://maps.google.com/?q=SMKN+Darul+Ulum+Muncar"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                >
                  <i className="fa-solid fa-diamond-turn-right text-amber-400 text-base" />
                  <span>Petunjuk Arah Maps</span>
                </a>
              </div>

              {/* Peta Lokasi Box */}
              {ext.maps_embed_url && (
                <div className="bg-[#2a323d] rounded-xl p-4 sm:p-5 mb-5 shadow-sm border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white">
                      <i className="fa-solid fa-map-location-dot text-amber-400" />
                      <span>Peta Lokasi SMKN Darul Ulum Muncar</span>
                    </h2>
                  </div>
                  <div className="rounded-lg overflow-hidden w-full h-[280px] sm:h-[380px] bg-gray-900 relative">
                    <iframe
                      src={ext.maps_embed_url}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Peta Lokasi SMKN Darul Ulum Muncar"
                    />
                  </div>
                </div>
              )}

              {/* Info Kontak Box */}
              <div className="bg-[#2a323d] rounded-xl p-4 sm:p-6 shadow-sm space-y-4 border border-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
                    <i className="fa-solid fa-location-dot text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-200">Alamat Lengkap</h3>
                    <p className="mt-0.5 text-xs sm:text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                      {ext.alamat || "JL. KH. Askandar Km.2 Wringinputih - Muncar, Banyuwangi, Jawa Timur, Indonesia 68472"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-pink-400">
                    <i className="fa-brands fa-instagram text-base" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-200">Instagram Resmi</h3>
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-block text-xs sm:text-sm text-sky-400 hover:text-sky-300 transition-colors underline"
                    >
                      {igHandle}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-emerald-400">
                    <i className="fa-brands fa-whatsapp text-base" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-200">WhatsApp Pengurus</h3>
                    <a
                      href={waChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-block font-mono text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {ext.telepon || rawWa}
                    </a>
                  </div>
                </div>

                {ext.email && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
                      <i className="fa-solid fa-envelope text-sm" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-200">Email Resmi</h3>
                      <a
                        href={`mailto:${ext.email}`}
                        className="mt-0.5 inline-block font-mono text-xs sm:text-sm text-amber-300 hover:underline"
                      >
                        {ext.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <SideBar popularArticles={popularArticles} pengumuman={announcements} />
        </div>
      </main>

      <SiteFooter extendedSettings={ext} />
    </div>
  );
}
