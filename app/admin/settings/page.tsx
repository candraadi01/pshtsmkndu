import { requireSuperAdmin } from "@/lib/services/auth";
import SettingsManagerClient from "@/components/admin/settings-manager-client";
import { getStoredPageSettings } from "@/lib/services/settings-store";
import { getSiteExtendedSettings } from "@/lib/services/site-settings-server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await requireSuperAdmin();
  const settings = await getStoredPageSettings();
  const extendedSettings = getSiteExtendedSettings();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
          <i className="fa-solid fa-sliders text-amber-500" />
          <span>Pengaturan Website & Identitas</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
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
