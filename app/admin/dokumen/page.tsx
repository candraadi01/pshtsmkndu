import { getStoredDocuments } from "@/lib/services/document-store";
import { requireSuperAdmin } from "@/lib/services/auth";
import DokumenManagerClient from "@/components/admin/dokumen-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminDokumenPage() {
  await requireSuperAdmin();
  const categories = await getStoredDocuments();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
          <i className="fa-solid fa-file-pdf text-amber-500" />
          <span>Manajemen Dokumen & Berkas Unduhan</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Kelola berkas SK resmi, formulir pendaftaran, materi AD/ART, dan panduan latihan
        </p>
      </div>

      <DokumenManagerClient initialCategories={categories as unknown as any[]} />
    </div>
  );
}
