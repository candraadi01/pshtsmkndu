import { getStoredPeople } from "@/lib/services/people-store";
import { requireAdmin } from "@/lib/services/auth";
import PeopleManagerClient from "@/components/admin/people-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const profile = await requireAdmin();
  const isSuperAdmin = profile.role === "super_admin";

  const peopleList = await getStoredPeople(isSuperAdmin ? undefined : "siswa");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
          <i className={`fa-solid ${isSuperAdmin ? "fa-users" : "fa-user-graduate"} text-amber-500`} />
          <span>
            {isSuperAdmin
              ? "Manajemen Anggota (Pelatih, Warga & Siswa)"
              : "Manajemen Data Siswa PSHT"}
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
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
