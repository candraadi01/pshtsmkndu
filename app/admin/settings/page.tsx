import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/services/auth";
import SettingsManagerClient from "@/components/admin/settings-manager-client";
import { fallbackHomeData } from "@/lib/demo-data";
import { getSiteExtendedSettings } from "@/lib/services/site-settings-server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: dbSettings } = await supabase
    .from("page_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Combine database settings with fallback defaults so fields are cleanly prefilled
  const settings = {
    ...fallbackHomeData.pageSetting,
    ...(dbSettings || {}),
  };

  const extendedSettings = getSiteExtendedSettings();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-sliders text-amber-400" />
          <span>Pengaturan Website & Identitas</span>
        </h2>
        <p className="text-xs text-gray-400">
          Ubah logo resmi, slider hero, profil & foto sejarah, visi & misi, media sosial, Google Maps, serta kontak website
        </p>
      </div>

      <SettingsManagerClient
        initialSettings={settings}
        initialExtendedSettings={extendedSettings}
        isSuperAdmin={profile?.role === "super_admin"}
      />
    </div>
  );
}
