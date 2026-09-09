import type { Metadata } from "next";
import Link from "next/link";
import PeopleGrid from "@/components/people-grid";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getPeopleByType } from "@/lib/services/people";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Daftar Pelatih - PSHT SMKN Darul Ulum Muncar",
    description:
      "Pelatih dan pembina berdedikasi yang membimbing ajaran budi luhur dan teknik pencak silat PSHT di SMKN Darul Ulum Muncar.",
  };
}

export default async function PelatihPage() {
  const coaches = await getPeopleByType("pelatih");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <PeopleGrid
          people={coaches}
          roleLabel="Pelatih"
          emptyMessage="Belum ada data pelatih yang dipublikasikan saat ini."
        />
      </main>

      <SiteFooter />
    </div>
  );
}
