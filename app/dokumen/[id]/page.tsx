import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DokumenView from "@/components/dokumen-view";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/services/artikel";
import { getTipeDokumenById, getTipeDokumenList } from "@/lib/services/dokumen";
import { getAnnouncements } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = await getTipeDokumenById(id);
  return {
    title: `${doc?.nama || "Dokumen"} - PSHT SMKN Darul Ulum Muncar`,
    description: `Unduh berkas ${doc?.nama || "dokumen"} resmi PSHT SMKN Darul Ulum Muncar.`,
  };
}

export default async function DokumenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [allTipe, currentDokumen, popularArticles, announcements] = await Promise.all([
    getTipeDokumenList(),
    getTipeDokumenById(id),
    getArticles({ limit: 5 }),
    getAnnouncements(4),
  ]);

  if (!currentDokumen) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DokumenView currentDokumen={currentDokumen} allTipeDokumen={allTipe} />
          <SideBar popularArticles={popularArticles} pengumuman={announcements} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
