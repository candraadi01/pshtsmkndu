import type { Metadata } from "next";
import Link from "next/link";
import PeopleGrid from "@/components/people-grid";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getPeopleByType } from "@/lib/services/people";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Daftar Siswa Aktif - PSHT SMKN Darul Ulum Muncar",
    description:
      "Siswa dan siswi yang sedang menempuh tahapan latihan fisik, mental, dan spiritual di PSHT Rayon SMKN Darul Ulum Muncar.",
  };
}

export default async function SiswaPage() {
  const students = await getPeopleByType("siswa");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <PeopleGrid
          people={students}
          roleLabel="Siswa"
          emptyMessage="Belum ada data siswa yang dipublikasikan saat ini."
        />
      </main>

      <SiteFooter />
    </div>
  );
}
