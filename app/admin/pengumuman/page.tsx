import { getStoredAnnouncements } from "@/lib/services/announcement-store";
import { requireSuperAdmin } from "@/lib/services/auth";
import PengumumanManagerClient from "@/components/admin/pengumuman-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminPengumumanPage() {
  await requireSuperAdmin();
  const announcements = await getStoredAnnouncements();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-amber-400" />
          <span>Manajemen Pengumuman & Agenda</span>
        </h2>
        <p className="text-xs text-gray-400">
          Kelola agenda latihan gabungan, ujian kenaikan tingkat (UKT), dan info resmi secara real-time
        </p>
      </div>

      <PengumumanManagerClient initialPengumuman={announcements} />
    </div>
  );
}
