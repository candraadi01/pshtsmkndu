import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGalleries } from "@/lib/services/galeri";
import { requireSuperAdmin } from "@/lib/services/auth";
import GalleryManagerClient from "@/components/admin/gallery-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminGaleriPage() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: dbGalleries } = await supabase
    .from("galleries")
    .select("*, images(*)")
    .order("created_at", { ascending: false });

  const fallback = await getGalleries();
  const galleries = (dbGalleries && dbGalleries.length > 0) ? dbGalleries : fallback;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-images text-amber-400" />
          <span>Manajemen Galeri & Foto Kegiatan</span>
        </h2>
        <p className="text-xs text-gray-400">
          Kelola album kegiatan, latihan bersama, dan dokumentasi kejuaraan PSHT
        </p>
      </div>

      <GalleryManagerClient initialGalleries={galleries as unknown as any[]} />
    </div>
  );
}
