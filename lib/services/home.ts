import { fallbackHomeData } from "@/lib/demo-data";
import { mapArtikel, type SupabaseArtikelRow } from "@/lib/mappers/artikel";
import { mapEkstrakurikuler, type SupabaseEkstrakurikulerRow } from "@/lib/mappers/ekstrakurikuler";
import { mapPengumuman, type SupabasePengumumanRow } from "@/lib/mappers/pengumuman";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import { getSiteExtendedSettings } from "@/lib/services/site-settings-server";
import { getStoredArticles } from "@/lib/services/article-store";
import { getStoredAnnouncements } from "@/lib/services/announcement-store";
import type {
  HomeData,
  PeopleStatistics,
} from "@/types/content";

async function countPeople(client: NonNullable<ReturnType<typeof createOptionalSupabaseClient>>, tipe: string) {
  const { count, error } = await client.from("people").select("id", { count: "exact", head: true }).eq("tipe", tipe);
  if (error) throw error;
  return count ?? 0;
}

export async function getHomeData(): Promise<HomeData> {
  const extendedSettings = getSiteExtendedSettings();
  const client = createOptionalSupabaseClient();
  if (!client) {
    return {
      ...fallbackHomeData,
      extendedSettings,
    };
  }

  try {
    const [settings, articles, announcements, extracurriculars, siswa, pelatih, warga, galleries] = await Promise.all([
      client.from("page_settings").select("*").limit(1).maybeSingle(),
      client.from("artikel").select("*").eq("status", "published").order("view_count", { ascending: false }).limit(3),
      client.from("pengumuman").select("*").order("created_at", { ascending: false }).limit(2),
      client.from("ekstrakurikuler").select("*").order("nama", { ascending: true }),
      countPeople(client, "siswa"), countPeople(client, "pelatih"), countPeople(client, "warga"),
      client.from("galleries").select("id", { count: "exact", head: true }),
    ]);

    const queryError = settings.error ?? articles.error ?? announcements.error ?? extracurriculars.error;
    if (queryError) throw queryError;

    const hasData = Boolean(
      settings.data ||
      (articles.data && articles.data.length > 0) ||
      (announcements.data && announcements.data.length > 0) ||
      (extracurriculars.data && extracurriculars.data.length > 0)
    );

    if (!hasData) {
      return fallbackHomeData;
    }

    const rawSetting = settings.data ?? fallbackHomeData.pageSetting;
    const pageSetting = {
      ...fallbackHomeData.pageSetting,
      ...rawSetting,
      logo: rawSetting.logo || fallbackHomeData.pageSetting.logo,
      gambar_hero: rawSetting.gambar_hero || fallbackHomeData.pageSetting.gambar_hero,
      gambar_hero1: rawSetting.gambar_hero1 || fallbackHomeData.pageSetting.gambar_hero1,
      gambar_hero2: rawSetting.gambar_hero2 || fallbackHomeData.pageSetting.gambar_hero2,
      gambar_hero3: rawSetting.gambar_hero3 || fallbackHomeData.pageSetting.gambar_hero3,
      judul_sejarah: rawSetting.judul_sejarah || fallbackHomeData.pageSetting.judul_sejarah,
      deskripsi_sejarah: rawSetting.deskripsi_sejarah || fallbackHomeData.pageSetting.deskripsi_sejarah,
      gambar_sejarah: rawSetting.gambar_sejarah || fallbackHomeData.pageSetting.gambar_sejarah,
      gambar_sejarah1: rawSetting.gambar_sejarah1 || fallbackHomeData.pageSetting.gambar_sejarah1,
      gambar_sejarah2: rawSetting.gambar_sejarah2 || fallbackHomeData.pageSetting.gambar_sejarah2,
      gambar_sejarah3: rawSetting.gambar_sejarah3 || fallbackHomeData.pageSetting.gambar_sejarah3,
      judul_video: rawSetting.judul_video || fallbackHomeData.pageSetting.judul_video,
      deskripsi_video: rawSetting.deskripsi_video || fallbackHomeData.pageSetting.deskripsi_video,
      url_video: rawSetting.url_video || fallbackHomeData.pageSetting.url_video,
      url_video1: rawSetting.url_video1 || fallbackHomeData.pageSetting.url_video1,
      url_video2: rawSetting.url_video2 || fallbackHomeData.pageSetting.url_video2,
    };
    const storedArticles = await getStoredArticles();
    const popularArticles = articles.data && articles.data.length > 0
      ? (articles.data as SupabaseArtikelRow[]).map(mapArtikel)
      : storedArticles.slice(0, 3).map((a) => mapArtikel(a as unknown as SupabaseArtikelRow));

    const storedAnnouncements = await getStoredAnnouncements();
    const mappedAnnouncements = announcements.data && announcements.data.length > 0
      ? (announcements.data as SupabasePengumumanRow[]).map(mapPengumuman)
      : storedAnnouncements.slice(0, 2).map((a) => mapPengumuman(a as unknown as SupabasePengumumanRow));

    const mappedExtracurriculars = extracurriculars.data && extracurriculars.data.length > 0
      ? (extracurriculars.data as SupabaseEkstrakurikulerRow[]).map(mapEkstrakurikuler)
      : fallbackHomeData.extracurriculars;

    const totalPeople = siswa + pelatih + warga;
    const galleryCount = galleries.count ?? fallbackHomeData.statistics.galeri ?? 4;
    const computedStatistics: PeopleStatistics = totalPeople > 0 || (extracurriculars.data && extracurriculars.data.length > 0) || (galleries.count !== null && galleries.count > 0)
      ? { siswa, pelatih, warga, ekstrakurikuler: mappedExtracurriculars.length, galeri: galleryCount }
      : fallbackHomeData.statistics;

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
      source: "supabase",
    };
  } catch (error) {
    console.warn("Supabase Home adapter memakai fallback:", error);
    return {
      ...fallbackHomeData,
      extendedSettings,
    };
  }
}
