import { getStoredArticles } from "@/lib/services/article-store";
import ArticleManagerClient from "@/components/admin/article-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminArtikelPage() {
  const articles = await getStoredArticles();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <i className="fa-solid fa-newspaper text-amber-500" />
            <span>Manajemen Artikel & Berita</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Publikasikan berita, rilis kejuaraan, dan materi pencak silat PSHT secara real-time
          </p>
        </div>
      </div>

      <ArticleManagerClient initialArticles={articles} />
    </div>
  );
}
