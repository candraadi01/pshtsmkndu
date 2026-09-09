import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { formatIndonesianDate } from "@/lib/date";
import { resolveMediaUrl } from "@/lib/media";
import { sanitizeHtml } from "@/lib/sanitize";
import { getArticleBySlug, getArticles } from "@/lib/services/artikel";
import { incrementArticleViews } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - PSHT SMKN Darul Ulum Muncar",
    };
  }

  return {
    title: `${article.judul} - PSHT SMKN Darul Ulum Muncar`,
    description: article.excerpt || `Baca artikel "${article.judul}" dari PSHT SMKN Darul Ulum Muncar.`,
  };
}

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Increment view counter asynchronously
  incrementArticleViews(slug).catch(() => {});

  const cleanContent = sanitizeHtml(article.isi);
  const allArticles = await getArticles(4);
  const relatedArticles = allArticles.filter((item) => item.slug !== article.slug).slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psht-smkndu.vercel.app";
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.judul,
    description: article.excerpt || article.judul,
    image: [article.gambar ? resolveMediaUrl(article.gambar) : `${siteUrl}/sh-emblem.png`],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: {
      "@type": "Organization",
      name: "PSHT SMKN Darul Ulum Muncar",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "PSHT SMKN Darul Ulum Muncar",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/sh-emblem.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/artikel/${article.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <div className="border-b border-gray-200 bg-neutral-100 py-3 text-xs text-gray-600">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4">
          <a href="/" className="hover:text-black">Beranda</a>
          <span>/</span>
          <a href="/artikel" className="hover:text-black">Artikel</a>
          <span>/</span>
          <span className="truncate text-black font-medium">{article.judul}</span>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <article className="overflow-hidden">
          <header className="mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {article.kategori}
              </span>
              {article.published_at && (
                <span className="text-sm text-gray-500">
                  <i className="fa-regular fa-calendar mr-1.5" />
                  {formatIndonesianDate(article.published_at)}
                </span>
              )}
              <span className="text-sm text-gray-500">
                <i className="fa-regular fa-eye mr-1.5" />
                {article.view_count} pembaca
              </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
              {article.judul}
            </h1>
          </header>

          {article.gambar && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md">
              <img
                src={resolveMediaUrl(article.gambar)}
                alt={article.judul}
                className="max-h-[500px] w-full object-cover"
              />
            </div>
          )}

          {article.excerpt && (
            <div className="mb-8 rounded-xl border-l-4 border-black bg-neutral-100 p-4 text-base italic leading-relaxed text-gray-700 md:text-lg">
              {article.excerpt}
            </div>
          )}

          <div
            className="prose prose-neutral max-w-none text-base leading-relaxed text-gray-800 md:text-lg [&>p]:mb-4 [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h3]:mb-2 [&>h3]:mt-4 [&>h3]:text-xl [&>h3]:font-bold [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>blockquote]:border-l-4 [&>blockquote]:border-black [&>blockquote]:pl-4 [&>blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
            <a
              href="/artikel"
              className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              <i className="fa-solid fa-arrow-left text-xs" /> Kembali ke Daftar Artikel
            </a>
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-16 border-t-2 border-black pt-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Artikel Lainnya</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedArticles.map((item) => (
                <a
                  key={item.id}
                  href={`/artikel/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                    <img
                      src={resolveMediaUrl(item.gambar)}
                      alt={item.judul}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-1 text-xs font-semibold text-gray-500">{item.kategori}</span>
                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-black">
                      {item.judul}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
