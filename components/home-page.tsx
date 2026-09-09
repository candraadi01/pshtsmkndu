"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useHomeMotion from "./use-home-motion";
import motionStyles from "./home-motion.module.css";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import { resolveMediaUrl, formatVideoEmbedUrl } from "@/lib/media";
import type { HomeData } from "@/types/content";

function shortText(value: string | null | undefined, limit = 16) {
  if (!value) return "";
  const words = value.replace(/<[^>]*>/g, "").trim().split(/\s+/);
  return words.length <= limit ? words.join(" ") : `${words.slice(0, limit).join(" ")}...`;
}

export default function HomePage({ data }: { data: HomeData }) {
  const { pageSetting: setting, popularArticles, announcements, extracurriculars, statistics } = data;
  const demoArticles = popularArticles;
  const demoAnnouncements = announcements;
  const demoExtracurriculars = extracurriculars;
  const heroImages = useMemo(() => {
    const list = [
      setting.gambar_hero,
      setting.gambar_hero1,
      setting.gambar_hero2,
      setting.gambar_hero3,
    ].filter(Boolean) as string[];
    return list.length > 0 ? list : ["foto-sekolah.webp"];
  }, [setting]);
  const profileImages = useMemo(() => {
    const list = [
      setting.gambar_sejarah,
      setting.gambar_sejarah1,
      setting.gambar_sejarah2,
      setting.gambar_sejarah3,
    ].filter(Boolean) as string[];
    return list.length > 0 ? list : ["/tentang.png"];
  }, [setting]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [profileIndex, setProfileIndex] = useState(0);
  const [activeProfile, setActiveProfile] = useState<"sejarah" | "visi_misi">("sejarah");
  const homeRef = useRef<HTMLDivElement>(null);
  useHomeMotion(homeRef, activeProfile);

  // Extended social media links
  const ext = data.extendedSettings;
  const rawWa = ext?.whatsapp || "6282338184217";
  const waUrl = rawWa.startsWith("http") ? rawWa : `https://wa.me/${rawWa.replace(/\D/g, "")}`;
  const rawIg = ext?.instagram || "https://instagram.com/psht.smkndu";
  const igUrl = rawIg.startsWith("http") ? rawIg : `https://instagram.com/${rawIg.replace(/^@/, "")}`;
  const rawTt = ext?.tiktok || "https://www.tiktok.com/@candratokez1";
  const ttUrl = rawTt.startsWith("http") ? rawTt : `https://www.tiktok.com/@${rawTt.replace(/^@/, "")}`;

  const videos = useMemo(
    () =>
      [setting.url_video, setting.url_video1, setting.url_video2]
        .filter(Boolean)
        .map((u) => formatVideoEmbedUrl(u as string))
        .filter(Boolean),
    [setting]
  );
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const prevVideoIndex = () => {
    if (videos.length === 0) return;
    setCurrentVideoIndex((current) => (current - 1 + videos.length) % videos.length);
  };

  const nextVideoIndex = () => {
    if (videos.length === 0) return;
    setCurrentVideoIndex((current) => (current + 1) % videos.length);
  };

  useEffect(() => {
    if (heroImages.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % heroImages.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    if (profileImages.length < 2) return;
    const timer = window.setInterval(() => setProfileIndex((current) => (current + 1) % profileImages.length), 5000);
    return () => window.clearInterval(timer);
  }, [profileImages.length]);

  return <div ref={homeRef} className={`${motionStyles.root} min-h-screen bg-white text-black`}>
    <SiteHeader />

    <main>
      <section data-home-reveal="fade-up" className="relative overflow-hidden border-b-8 border-black">
        <div className="relative h-60 w-full md:h-[28rem]">
          {heroImages.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={resolveMediaUrl(image)}
              alt="Hero PSHT"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${heroIndex === index ? "z-10 opacity-100" : "z-0 opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute left-1/2 top-20 z-30 hidden max-w-4xl -translate-x-1/2 px-4 text-center text-white md:block">
            <h1 className="whitespace-nowrap py-4 text-3xl font-bold md:text-6xl">{setting.judul_hero}</h1>
            <p className="text-sm md:text-lg">{setting.deskripsi_hero}</p>
          </div>
          {heroImages.length > 1 && (
            <>
              <button type="button" onClick={() => setHeroIndex((heroIndex - 1 + heroImages.length) % heroImages.length)} className="absolute left-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/30 p-2 text-2xl text-white hover:bg-black/60" aria-label="Slide sebelumnya">‹</button>
              <button type="button" onClick={() => setHeroIndex((heroIndex + 1) % heroImages.length)} className="absolute right-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/30 p-2 text-2xl text-white hover:bg-black/60" aria-label="Slide berikutnya">›</button>
            </>
          )}
        </div>
        <div className="bg-black p-4 text-left text-white md:hidden"><h1 className="text-xl font-bold">{setting.judul_hero}</h1><p className="mt-2 text-sm">{setting.deskripsi_hero}</p></div>
      </section>

      <section className="relative z-20 pt-6 md:-mt-24 md:mb-10 md:pt-0"><div className="mx-auto max-w-4xl px-4"><div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
        {[["fa-people-group", `${statistics.siswa}`, "Siswa Aktif", "/siswa"], ["fa-user-ninja", `${statistics.pelatih}`, "Pelatih", "/pelatih"], ["fa-users-between-lines", `${statistics.warga}`, "Warga", "/warga"], ["fa-images", `${statistics.galeri ?? 4}`, "Galeri", "/galeri"]].map(([icon, value, label, href], index) => <a data-home-reveal={["fade-right", "fade-down", "fade-down", "fade-left"][index]} data-home-card href={href} key={label} className="group rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-2xl md:p-6"><i className={`fa-solid ${icon} mb-3 block text-3xl text-black transition-transform duration-300 group-hover:scale-110 md:text-5xl`} /><div className="mb-1 text-xl font-bold text-gray-800 md:text-3xl">{value}</div><div className="text-sm font-medium text-gray-600 md:text-base">{label}</div></a>)}
      </div></div></section>

      <div className="fixed right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-4">
        {igUrl && (
          <a
            href={igUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-l-lg bg-black text-white shadow-lg hover:bg-white hover:text-black md:h-16 md:w-16 transition-colors"
            data-home-reveal="fade-left" data-home-delay="100" aria-label="Instagram"
          >
            <i className="fab fa-instagram" />
          </a>
        )}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-l-lg bg-black text-white shadow-lg hover:bg-white hover:text-black md:h-16 md:w-16 transition-colors"
            data-home-reveal="fade-left" data-home-delay="200" aria-label="WhatsApp"
          >
            <i className="fab fa-whatsapp" />
          </a>
        )}
        {ttUrl && (
          <a
            href={ttUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-l-lg bg-black text-white shadow-lg hover:bg-white hover:text-black md:h-16 md:w-16 transition-colors"
            data-home-reveal="fade-left" data-home-delay="300" aria-label="TikTok"
          >
            <i className="fab fa-tiktok" />
          </a>
        )}
      </div>

      <section data-home-reveal="fade-up" className="bg-white px-4 py-8 sm:px-8 md:px-10">
        <h2 className="mb-8 border-b-4 border-black pb-5 text-center text-3xl font-bold text-black md:text-4xl">Profil Organisasi</h2>
        <div className="mb-10 flex justify-center gap-4">
          <button type="button" onClick={() => setActiveProfile("sejarah")} className={`rounded-full border-2 px-6 py-2 font-semibold transition ${activeProfile === "sejarah" ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"}`}>Sejarah</button>
          <button type="button" onClick={() => setActiveProfile("visi_misi")} className={`rounded-full border-2 px-6 py-2 font-semibold transition ${activeProfile === "visi_misi" ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"}`}>Visi &amp; Misi</button>
        </div>
        {activeProfile === "sejarah" ? (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
            <div data-home-reveal="zoom-in-right" className="relative h-52 overflow-hidden rounded-2xl shadow-xl md:h-96">
              {profileImages.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={resolveMediaUrl(image)}
                  alt={setting.judul_sejarah || "Sejarah PSHT"}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${profileIndex === index ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              {profileImages.length > 1 && (
                <>
                  <button type="button" onClick={() => setProfileIndex((profileIndex - 1 + profileImages.length) % profileImages.length)} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-2xl text-white hover:bg-black/70" aria-label="Foto sebelumnya">‹</button>
                  <button type="button" onClick={() => setProfileIndex((profileIndex + 1) % profileImages.length)} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-2xl text-white hover:bg-black/70" aria-label="Foto berikutnya">›</button>
                </>
              )}
            </div>
            <div data-home-reveal="fade-left" data-home-delay="200" className="flex flex-col gap-4">
              <h3 className="border-l-4 border-black pl-4 text-xl font-bold text-black md:text-2xl">{setting.judul_sejarah}</h3>
              <p className="text-justify text-sm text-gray-700 md:text-base leading-relaxed">{setting.deskripsi_sejarah}</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
            <div data-home-reveal="fade-right" data-home-delay="150" className="flex flex-col gap-4 rounded-xl border-l-4 border-black bg-white p-6 shadow-lg">
              <div className="flex items-center gap-3"><i className="fas fa-star text-xl text-amber-500" /><h3 className="text-2xl font-bold">Visi</h3></div>
              <p className="whitespace-pre-line text-justify text-sm text-gray-700 md:text-base leading-relaxed">{setting.visi}</p>
            </div>
            <div data-home-reveal="fade-left" data-home-delay="200" className="flex flex-col gap-4 rounded-xl border-l-4 border-black bg-white p-6 shadow-lg">
              <div className="flex items-center gap-3"><i className="fa-solid fa-list text-xl text-amber-500" /><h3 className="text-2xl font-bold">Misi</h3></div>
              <p className="text-justify text-sm leading-relaxed text-gray-700 md:text-base">{setting.misi}</p>
            </div>
          </div>
        )}
      </section>

      <section data-home-reveal="fade-up" className="border-t-8 border-black bg-black px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 data-home-reveal="fade-down" className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">Artikel Populer</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoArticles.slice(0, 3).map((article, index) => (
              <article data-home-reveal="zoom-in" data-home-delay={(index + 1) * 100} data-home-card key={article.id} className="relative flex h-full flex-col rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-sm transition hover:border-white/40">
                <div className="absolute right-5 top-5 z-10 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/20">
                  <i className="fa fa-eye text-amber-400" /> {article.view_count}
                </div>
                <div className="mb-3 aspect-[3/2] overflow-hidden rounded-lg bg-zinc-800">
                  <img src={resolveMediaUrl(article.gambar)} alt={article.judul} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white leading-snug">{article.judul}</h3>
                <p className="mb-4 flex-grow text-sm text-zinc-300 line-clamp-3">{article.excerpt}</p>
                <a href={`/artikel/${article.slug}`} className="self-end inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-black transition-colors">
                  <span>Selengkapnya</span>
                  <i className="fa-solid fa-arrow-right text-[10px]" />
                </a>
              </article>
            ))}
          </div>
          <div data-home-reveal="fade-up" className="mt-8 text-center">
            <a href="/artikel" className="inline-block rounded-full border border-white px-6 py-2 text-sm font-semibold text-white hover:bg-white hover:text-black transition-colors">
              Lihat Artikel Lainnya
            </a>
          </div>
        </div>
      </section>

      <section data-home-reveal="fade-up" className="border-t-8 border-black bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 data-home-reveal="fade-down" className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              Pengumuman Terbaru
            </h2>
            <div className="w-16 h-1 bg-gray-600 mx-auto mt-2.5 rounded-full" />
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {demoAnnouncements.slice(0, 2).map((item) => (
              <article
                data-home-card
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-gray-500"
              >
                <div>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <i className="fa-regular fa-calendar mr-1.5" />
                    <span>{item.created_at_formatted}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-gray-600 transition leading-snug">
                    <a href={`/pengumuman/${item.id}`}>{item.judul}</a>
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {shortText(item.isi, 24)}
                  </p>
                </div>
                <div>
                  <a
                    href={`/pengumuman/${item.id}`}
                    className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full bg-black text-white hover:bg-white hover:text-black border border-black transition-all duration-300"
                  >
                    <span>Lihat</span>
                    <i className="fa-solid fa-arrow-right text-[10px]" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div data-home-reveal="fade-up" className="mt-8 text-center">
            <a
              href="/pengumuman"
              className="inline-block text-black border border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition duration-300 font-medium text-sm"
            >
              Lihat Pengumuman Lainnya
            </a>
          </div>
        </div>
      </section>

      <section data-home-reveal="fade-up" className="border-t-8 border-black bg-white px-4 py-12"><div className="mx-auto max-w-6xl"><h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Ekstrakurikuler</h2><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{demoExtracurriculars.map((item) => <a data-home-card key={item.id} href={`/ekstrakurikuler/${item.id}`} className="group block overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow transition hover:shadow-lg"><div className="h-48 overflow-hidden bg-neutral-100"><img src={resolveMediaUrl(item.gambar)} alt={item.nama} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /></div><div className="p-5"><h3 className="mb-2 text-lg font-bold text-gray-900 transition group-hover:text-black">{item.nama}</h3><p className="text-sm leading-relaxed text-gray-700">{shortText(item.deskripsi)}</p><span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-black group-hover:underline">Lihat Detail <i className="fa-solid fa-arrow-right text-[10px]" /></span></div></a>)}</div><div data-home-reveal="fade-up" className="mt-8 text-center"><a href="/ekstrakurikuler" className="inline-block rounded-full border border-black px-6 py-2 hover:bg-black hover:text-white">Lihat Ekstrakurikuler Lainnya</a></div></div></section>

      {/* Video Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black to-gray-900 px-4 py-16">
        {/* Background abstract shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gray-500" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-gray-400" />
          <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-orange-500" />
        </div>

        {/* Diagonal pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)",
            backgroundSize: "10px 10px",
          }}
        />

        {/* Content */}
        <div className="relative mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div data-home-reveal="fade-down-left" className="mb-3 inline-block rounded-full bg-gray-200 px-4 py-1 text-xs sm:text-sm font-bold text-black select-none">
            MENGENAL LEBIH JAUH
          </div>

          {/* Title */}
          <h2 data-home-reveal="fade-up-right" className="mb-4 text-3xl font-extrabold text-white drop-shadow-lg md:text-5xl">
            {setting.judul_video || "Video Profil PSHT SMKNDU"}
          </h2>

          {/* Description */}
          <p data-home-reveal="fade-up" className="mx-auto mb-8 max-w-2xl text-sm text-gray-100 md:text-base">
            {setting.deskripsi_video ||
              "Saksikan perjalanan inspiratif kami dalam membangun organisasi yang menjunjung tinggi persatuan."}
          </p>

          {/* Video player */}
          <div data-home-reveal="flip-left" className="relative mb-8">
            {/* Glow effect */}
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-tr from-gray-400 via-gray-500 to-black opacity-75 blur-sm" />

            {/* Video iframe or placeholder */}
            <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-white/10 bg-black shadow-2xl">
              {videos.length > 0 ? (
                <iframe
                  className="h-full w-full"
                  src={videos[currentVideoIndex]}
                  title="Video Profil PSHT"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-200 text-gray-600">
                  Belum Ada Video Profil
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Prev / Next */}
        <div className="relative z-10 flex justify-center gap-4">
          <button
            type="button"
            onClick={prevVideoIndex}
            className="w-24 rounded-lg bg-white p-2 font-medium text-black shadow transition hover:bg-black hover:text-white"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={nextVideoIndex}
            className="w-24 rounded-lg bg-white p-2 font-medium text-black shadow transition hover:bg-black hover:text-white"
          >
            Next
          </button>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -bottom-10 -left-10 hidden h-40 w-40 rounded-full bg-black opacity-50 md:block" />
        <div className="pointer-events-none absolute -right-20 -top-20 hidden h-60 w-60 rounded-full bg-gray-600 opacity-30 md:block" />
      </section>
    </main>

    <SiteFooter extendedSettings={data.extendedSettings} />
  </div>;
}
