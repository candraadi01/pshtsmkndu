import { getStoredGalleries } from "@/lib/services/gallery-store";
import { requireSuperAdmin } from "@/lib/services/auth";
import GalleryManagerClient from "@/components/admin/gallery-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminGaleriPage() {
  await requireSuperAdmin();
  const galleries = await getStoredGalleries();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
          <i className="fa-solid fa-images text-amber-500" />
          <span>Manajemen Galeri & Foto Kegiatan</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Kelola album kegiatan, latihan bersama, dan dokumentasi kejuaraan PSHT
        </p>
      </div>

      <GalleryManagerClient initialGalleries={galleries as unknown as any[]} />
    </div>
  );
}
