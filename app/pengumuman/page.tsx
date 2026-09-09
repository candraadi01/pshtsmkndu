import type { Metadata } from "next";
import AnnouncementList from "@/components/announcement-list";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/services/artikel";
import { getAnnouncements } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Pengumuman - PSHT SMKN Darul Ulum Muncar",
    description: "Pengumuman resmi, jadwal kegiatan, dan informasi penting bagi seluruh anggota PSHT SMKN Darul Ulum Muncar.",
  };
}

export default async function PengumumanIndexPage() {
  const [announcements, popularArticles] = await Promise.all([
    getAnnouncements(),
    getArticles({ limit: 5 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <AnnouncementList announcements={announcements} />
          <SideBar popularArticles={popularArticles} pengumuman={announcements} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
