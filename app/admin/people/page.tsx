import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPeopleByType } from "@/lib/services/people";
import { getCurrentUserProfile, requireAdmin } from "@/lib/services/auth";
import PeopleManagerClient from "@/components/admin/people-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const profile = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const isSuperAdmin = profile.role === "super_admin";

  let query = supabase.from("people").select("*").order("created_at", { ascending: false });
  if (!isSuperAdmin) {
    query = query.eq("tipe", "siswa");
  }

  const { data: dbPeople } = await query;

  let peopleList: any[] = dbPeople || [];
  if (peopleList.length === 0) {
    if (isSuperAdmin) {
      const [pelatih, warga, siswa] = await Promise.all([
        getPeopleByType("pelatih"),
        getPeopleByType("warga"),
        getPeopleByType("siswa"),
      ]);
      peopleList = [...pelatih, ...warga, ...siswa];
    } else {
      peopleList = await getPeopleByType("siswa");
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className={`fa-solid ${isSuperAdmin ? "fa-users" : "fa-user-graduate"} text-amber-400`} />
          <span>
            {isSuperAdmin
              ? "Manajemen Anggota (Pelatih, Warga & Siswa)"
              : "Manajemen Data Siswa PSHT"}
          </span>
        </h2>
        <p className="text-xs text-gray-400">
          {isSuperAdmin
            ? "Pendataan anggota resmi PSHT Sub Rayon SMKN Darul Ulum Muncar"
            : "Kelola data pendaftaran dan keaktifan siswa latihan PSHT SMKN Darul Ulum"}
        </p>
      </div>

      <PeopleManagerClient
        initialPeople={(peopleList || []) as any[]}
        userRole={profile.role}
      />
    </div>
  );
}
