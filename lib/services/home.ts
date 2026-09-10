import { fallbackHomeData } from "@/lib/demo-data";
import { mapArtikel, type SupabaseArtikelRow } from "@/lib/mappers/artikel";
import { mapEkstrakurikuler, type SupabaseEkstrakurikulerRow } from "@/lib/mappers/ekstrakurikuler";
import { mapPengumuman, type SupabasePengumumanRow } from "@/lib/mappers/pengumuman";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import { getSiteExtendedSettings } from "@/lib/services/site-settings-server";
import { getStoredArticles } from "@/lib/services/article-store";
import { getStoredAnnouncements } from "@/lib/services/announcement-store";
import { getStoredPageSettings } from "@/lib/services/settings-store";
import { getStoredEkstrakurikuler } from "@/lib/services/ekskul-store";
import { getStoredPeople } from "@/lib/services/people-store";
import { getStoredGalleries } from "@/lib/services/gallery-store";
import type {
  HomeData,
  PeopleStatistics,
} from "@/types/content";

export async function getHomeData(): Promise<HomeData> {
  const extendedSettings = getSiteExtendedSettings();

  // Load from resilient stores
  const [storedSettings, storedArticles, storedAnnouncements, storedEkskul, allPeople, galleries] = await Promise.all([
    getStoredPageSettings(),
    getStoredArticles(),
    getStoredAnnouncements(),
    getStoredEkstrakurikuler(),
    getStoredPeople(),
    getStoredGalleries(),
  ]);

  const client = createOptionalSupabaseClient();
  let dbSettings: any = null;
  let dbArticles: any = null;
  let dbAnnouncements: any = null;
  let dbExtracurriculars: any = null;

  if (client) {
    try {
      const [sRes, aRes, pRes, eRes] = await Promise.all([
        client.from("page_settings").select("*").limit(1).maybeSingle(),
        client.from("artikel").select("*").eq("status", "published").order("view_count", { ascending: false }).limit(3),
        client.from("pengumuman").select("*").order("created_at", { ascending: false }).limit(2),
        client.from("ekstrakurikuler").select("*").order("nama", { ascending: true }),
      ]);
      dbSettings = sRes.data;
      dbArticles = aRes.data;
      dbAnnouncements = pRes.data;
      dbExtracurriculars = eRes.data;
    } catch {
      // Ignore Supabase fetch errors, use stored data
    }
  }

  const rawSetting = dbSettings || storedSettings || fallbackHomeData.pageSetting;
  const pageSetting = {
    ...fallbackHomeData.pageSetting,
    ...storedSettings,
    ...rawSetting,
    logo: rawSetting.logo || storedSettings.logo || fallbackHomeData.pageSetting.logo,
    gambar_hero: rawSetting.gambar_hero ?? storedSettings.gambar_hero,
    gambar_hero1: rawSetting.gambar_hero1 ?? storedSettings.gambar_hero1,
    gambar_hero2: rawSetting.gambar_hero2 ?? storedSettings.gambar_hero2,
    gambar_hero3: rawSetting.gambar_hero3 ?? storedSettings.gambar_hero3,
    judul_sejarah: rawSetting.judul_sejarah || storedSettings.judul_sejarah || fallbackHomeData.pageSetting.judul_sejarah,
    deskripsi_sejarah: rawSetting.deskripsi_sejarah || storedSettings.deskripsi_sejarah || fallbackHomeData.pageSetting.deskripsi_sejarah,
    gambar_sejarah: rawSetting.gambar_sejarah ?? storedSettings.gambar_sejarah,
    gambar_sejarah1: rawSetting.gambar_sejarah1 ?? storedSettings.gambar_sejarah1,
    gambar_sejarah2: rawSetting.gambar_sejarah2 ?? storedSettings.gambar_sejarah2,
    gambar_sejarah3: rawSetting.gambar_sejarah3 ?? storedSettings.gambar_sejarah3,
    judul_video: rawSetting.judul_video || storedSettings.judul_video || fallbackHomeData.pageSetting.judul_video,
    deskripsi_video: rawSetting.deskripsi_video || storedSettings.deskripsi_video || fallbackHomeData.pageSetting.deskripsi_video,
    url_video: rawSetting.url_video ?? storedSettings.url_video,
    url_video1: rawSetting.url_video1 ?? storedSettings.url_video1,
    url_video2: rawSetting.url_video2 ?? storedSettings.url_video2,
  };

  const popularArticles = dbArticles && dbArticles.length > 0
    ? (dbArticles as SupabaseArtikelRow[]).map(mapArtikel)
    : storedArticles.slice(0, 3).map((a) => mapArtikel(a as unknown as SupabaseArtikelRow));

  const mappedAnnouncements = dbAnnouncements && dbAnnouncements.length > 0
    ? (dbAnnouncements as SupabasePengumumanRow[]).map(mapPengumuman)
    : storedAnnouncements.slice(0, 2).map((a) => mapPengumuman(a as unknown as SupabasePengumumanRow));

  const mappedExtracurriculars = dbExtracurriculars && dbExtracurriculars.length > 0
    ? (dbExtracurriculars as SupabaseEkstrakurikulerRow[]).map(mapEkstrakurikuler)
    : storedEkskul;

  const siswaCount = allPeople.filter((p) => p.tipe === "siswa").length;
  const pelatihCount = allPeople.filter((p) => p.tipe === "pelatih").length;
  const wargaCount = allPeople.filter((p) => p.tipe === "warga").length;

  const computedStatistics: PeopleStatistics = {
    siswa: siswaCount,
    pelatih: pelatihCount,
    warga: wargaCount,
    ekstrakurikuler: mappedExtracurriculars.length,
    galeri: galleries.length,
  };

  const statistics: PeopleStatistics = {
    siswa: extendedSettings.stat_siswa_override ?? computedStatistics.siswa,
    pelatih: extendedSettings.stat_pelatih_override ?? computedStatistics.pelatih,
    warga: extendedSettings.stat_warga_override ?? computedStatistics.warga,
    galeri: extendedSettings.stat_galeri_override ?? computedStatistics.galeri,
    ekstrakurikuler: computedStatistics.ekstrakurikuler,
  };

  return {
    pageSetting,
    popularArticles,
    announcements: mappedAnnouncements,
    extracurriculars: mappedExtracurriculars,
    statistics,
    extendedSettings,
    source: dbSettings ? "supabase" : "fallback",
  };
}
