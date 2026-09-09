import { requireSuperAdmin } from "@/lib/services/auth";
import { getAdminActivityLogs } from "@/lib/services/activity-logger";
import AuditLogsClient from "@/components/admin/audit-logs-client";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requireSuperAdmin();
  const logs = await getAdminActivityLogs(100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <i className="fa-solid fa-shield-halved text-xs" />
          <span>Super Admin Exclusive</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-amber-400" />
          <span>Log Aktivitas & Audit Tindakan Admin</span>
        </h2>
        <p className="text-xs text-gray-400">
          Pantau seluruh kegiatan, perubahan artikel, penambahan/penghapusan siswa, serta perubahan data yang dilakukan oleh akun Admin maupun Super Admin.
        </p>
      </div>

      <AuditLogsClient initialLogs={logs} />
    </div>
  );
}
