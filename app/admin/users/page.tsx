import { requireSuperAdmin } from "@/lib/services/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import UsersManagerClient from "@/components/admin/users-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentProfile = await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <i className="fa-solid fa-lock text-xs" />
          <span>Area Khusus Super Admin</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-user-shield text-amber-400" />
          <span>Kelola Akun Administrator & Hak Akses</span>
        </h2>
        <p className="text-xs text-gray-400">
          Atur peran akun (Super Admin vs Admin) dan pantau siapa saja yang memiliki akses ke dashboard
        </p>
      </div>

      <UsersManagerClient
        profiles={profiles || []}
        currentUserId={currentProfile.id}
      />
    </div>
  );
}
