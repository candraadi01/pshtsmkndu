import type { Metadata } from "next";
import RegistrasiForm from "@/components/registrasi-form";
import SideBar from "@/components/side-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getArticles } from "@/lib/services/artikel";
import { getHomeData } from "@/lib/services/home";
import { getAnnouncements } from "@/lib/services/pengumuman";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Pendaftaran / Registrasi - PSHT SMKN Darul Ulum Muncar",
    description:
      "Informasi pendaftaran calon siswa dan anggota baru Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar.",
  };
}

export default async function RegistrasiPage() {
  const [homeData, popularArticles, announcements] = await Promise.all([
    getHomeData(),
    getArticles({ limit: 5 }),
    getAnnouncements(4),
  ]);

  const syaratPendaftaran =
    homeData.pageSetting?.syarat_pendaftaran || "<p>Silakan lengkapi formulir pendaftaran di bawah ini atau hubungi pengurus untuk informasi pendaftaran.</p>";

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-black">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          {/* Main Content Card */}
          <div className="w-full lg:w-[65%] bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 flex flex-col justify-between">
            <div>
              {/* Title Header */}
              <div className="border-l-4 border-black pl-4 mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Pendaftaran Siswa Baru
                </h1>
                <p className="text-gray-500 mt-1.5 text-xs sm:text-sm">
                  Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar
                </p>
              </div>

              {/* Interactive Form Component with Tabs */}
              <RegistrasiForm syaratPendaftaranHtml={syaratPendaftaran} />
            </div>
          </div>

          {/* Sidebar */}
          <SideBar popularArticles={popularArticles} pengumuman={announcements} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
