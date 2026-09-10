import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getExtracurriculars } from "@/lib/services/ekstrakurikuler";
import { requireSuperAdmin } from "@/lib/services/auth";
import EkstrakurikulerManagerClient from "@/components/admin/ekstrakurikuler-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminEkstrakurikulerPage() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: dbData } = await supabase
    .from("ekstrakurikuler")
    .select("*")
    .order("created_at", { ascending: false });

  const fallback = await getExtracurriculars();
  const items = (dbData && dbData.length > 0) ? dbData : fallback;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
          <i className="fa-solid fa-award text-amber-500" />
          <span>Manajemen Kegiatan Ekstrakurikuler</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Kelola profil kegiatan ekskul, jadwal latihan rutin, nama pembina & ketua
        </p>
      </div>

      <EkstrakurikulerManagerClient initialItems={items as unknown as any[]} />
    </div>
  );
}
