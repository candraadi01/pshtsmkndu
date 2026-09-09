import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "./auth";

export interface ActivityLog {
  id: number;
  user_id: string | null;
  user_name: string;
  role: string;
  action: string;
  entity: string;
  details: string | null;
  created_at: string;
}

/**
 * Records an administrative action into admin_activity_logs.
 */
export async function logAdminActivity({
  action,
  entity,
  details,
}: {
  action: string;
  entity: string;
  details: string;
}) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    const supabase = await createSupabaseServerClient();
    await supabase.from("admin_activity_logs").insert({
      user_id: profile.id,
      user_name: profile.display_name,
      role: profile.role,
      action,
      entity,
      details,
    });
  } catch {
    // Fail silently so primary CRUD operation is never hindered
  }
}

/**
 * Retrieves activity logs for Super Admin review.
 */
export async function getAdminActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as ActivityLog[];
  } catch {
    return [];
  }
}
