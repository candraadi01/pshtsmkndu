import type { Metadata } from "next";
import Link from "next/link";
import PeopleGrid from "@/components/people-grid";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getPeopleByType } from "@/lib/services/people";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Daftar Warga - PSHT SMKN Darul Ulum Muncar",
    description:
      "Warga Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar yang telah disahkan tingkat I.",
  };
}

export default async function WargaPage() {
  const members = await getPeopleByType("warga");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <PeopleGrid
          people={members}
          roleLabel="Warga"
          emptyMessage="Belum ada data warga yang dipublikasikan saat ini."
        />
      </main>

      <SiteFooter />
    </div>
  );
}
