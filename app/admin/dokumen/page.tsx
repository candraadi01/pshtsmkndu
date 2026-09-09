import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTipeDokumenList } from "@/lib/services/dokumen";
import { requireSuperAdmin } from "@/lib/services/auth";
import DokumenManagerClient from "@/components/admin/dokumen-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminDokumenPage() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: dbCategories } = await supabase
    .from("tipe_dokumen")
    .select("*, dokumen(*)")
    .order("created_at", { ascending: false });

  const fallback = await getTipeDokumenList();
  const categories = (dbCategories && dbCategories.length > 0) ? dbCategories : fallback;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-file-pdf text-amber-400" />
          <span>Manajemen Dokumen & Berkas Unduhan</span>
        </h2>
        <p className="text-xs text-gray-400">
          Kelola berkas SK resmi, formulir pendaftaran, materi AD/ART, dan panduan latihan
        </p>
      </div>

      <DokumenManagerClient initialCategories={categories as unknown as any[]} />
    </div>
  );
}
