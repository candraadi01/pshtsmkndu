import type { Metadata } from "next";
import { getCurrentUserProfile } from "@/lib/services/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";

export const metadata: Metadata = {
  title: "Admin Dashboard - PSHT SMKN Darul Ulum Muncar",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  // If on login page, render children directly without the admin shell
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-slate-950">
      {profile && <AdminSidebar role={profile.role} displayName={profile.display_name} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f1f5f9]">
        {profile && <AdminHeader profile={profile} />}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
