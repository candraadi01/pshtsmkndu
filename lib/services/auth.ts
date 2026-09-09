"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "admin" | "user";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export const getCurrentUserProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  let role: AdminRole = (profile?.role as AdminRole) || (user.user_metadata?.role as AdminRole) || "admin";

  // Only check superAdminCount if the current user is not already super_admin
  if (role !== "super_admin") {
    const { count: superAdminCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (!superAdminCount || superAdminCount === 0) {
      role = "super_admin";
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profile?.display_name || user.email?.split("@")[0] || "Super Admin",
        role: "super_admin",
      });
    }
  }

  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Super Admin";

  return {
    id: user.id,
    email: user.email || "",
    display_name: displayName,
    role,
  };
});

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Login gagal: " + (error.message || "Email atau kata sandi salah.") };
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role || data.user.user_metadata?.role;
  if (role !== "admin" && role !== "super_admin") {
    // If first user, auto-assign super_admin or allow
    // Check if any profiles exist:
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    if (!count || count <= 1) {
      // First user becomes super_admin
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: data.user.email?.split("@")[0] || "Super Admin",
        role: "super_admin",
      });
    } else {
      await supabase.auth.signOut();
      return { error: "Akses ditolak: Akun Anda tidak memiliki hak akses administrator." };
    }
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function requireAdmin(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/admin/login?error=unauthorized");
  }
  return profile;
}

export async function requireSuperAdmin(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "super_admin") {
    redirect("/admin?error=forbidden");
  }
  return profile;
}
