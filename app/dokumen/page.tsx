import type { Metadata } from "next";
import DokumenView from "@/components/dokumen-view";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/services/artikel";
import { getTipeDokumenList } from "@/lib/services/dokumen";
import { getAnnouncements } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Dokumen & Unduhan - PSHT SMKN Darul Ulum Muncar",
    description: "Unduh formulir, surat izin, dan berkas administrasi resmi PSHT Rayon SMKN Darul Ulum Muncar.",
  };
}

export default async function DokumenIndexPage() {
  const [allTipe, popularArticles, announcements] = await Promise.all([
    getTipeDokumenList(),
    getArticles({ limit: 5 }),
    getAnnouncements(4),
  ]);

  const currentDokumen = allTipe[0] ?? {
    id: 1,
    nama: "Dokumen",
    deskripsi: "Belum ada dokumen tersedia.",
    dokumen: [],
  };

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
