import type { Metadata } from "next";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import StrukturOrganisasiView from "@/components/struktur-organisasi-view";
import { getArticles } from "@/lib/services/artikel";
import { getHomeData } from "@/lib/services/home";
import { getAnnouncements } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Struktur Organisasi - PSHT SMKN Darul Ulum Muncar",
    description:
      "Bagan susunan kepengurusan dan struktur organisasi resmi Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar.",
  };
}

export default async function StrukturOrganisasiPage() {
  const [homeData, popularArticles, announcements] = await Promise.all([
    getHomeData(),
    getArticles({ limit: 5 }),
    getAnnouncements(4),
  ]);

  const gambarStruktur = homeData.pageSetting?.gambar_struktur_organisasi;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-black">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <StrukturOrganisasiView gambarStruktur={gambarStruktur} />
          <SideBar popularArticles={popularArticles} pengumuman={announcements} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
