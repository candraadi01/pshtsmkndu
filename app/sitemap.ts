import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/services/artikel";
import { getAnnouncements } from "@/lib/services/pengumuman";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://psht-smkndu.vercel.app").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/artikel`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pengumuman`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/registrasi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/struktur-organisasi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/pelatih`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/warga`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/siswa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ekstrakurikuler`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dokumen`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const [articles, announcements] = await Promise.all([
      getArticles({ limit: 100 }).catch(() => []),
      getAnnouncements(50).catch(() => []),
    ]);

    const articleRoutes: MetadataRoute.Sitemap = articles
      .filter((a) => a.slug)
      .map((a) => ({
        url: `${baseUrl}/artikel/${encodeURIComponent(a.slug)}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : (a.created_at ? new Date(a.created_at) : new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const announcementRoutes: MetadataRoute.Sitemap = announcements
      .filter((p) => p.id)
      .map((p) => ({
        url: `${baseUrl}/pengumuman/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : (p.created_at ? new Date(p.created_at) : new Date()),
        changeFrequency: "monthly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...articleRoutes, ...announcementRoutes];
  } catch {
    return staticRoutes;
  }
}
