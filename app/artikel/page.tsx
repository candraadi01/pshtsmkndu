import type { Metadata } from "next";
import ArticleList from "@/components/article-list";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/services/artikel";
import { getAnnouncements } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; search?: string }>;
}): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const q = params?.q || params?.search;

  if (q) {
    return {
      title: `Pencarian: "${q}" - Artikel PSHT SMKN Darul Ulum Muncar`,
      description: `Hasil pencarian artikel untuk kata kunci "${q}" di PSHT SMKN Darul Ulum Muncar.`,
    };
  }

  return {
    title: "Artikel - PSHT SMKN Darul Ulum Muncar",
    description: "Kumpulan artikel, informasi kegiatan, dan kabar terbaru seputar PSHT SMKN Darul Ulum Muncar.",
  };
}

export default async function ArtikelIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; search?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const rawQuery = params?.q || params?.search || "";
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  const [articles, popularArticles, announcements] = await Promise.all([
    getArticles({ search: query }),
    getArticles({ limit: 5 }),
    getAnnouncements(4),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ArticleList articles={articles} query={query} />
          <SideBar popularArticles={popularArticles} pengumuman={announcements} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
