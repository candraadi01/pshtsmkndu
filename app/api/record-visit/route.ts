import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";
import { recordLocalVisit } from "@/lib/services/metrics-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path.slice(0, 255) : "/";

    // Hanya catat kunjungan halaman utama / beranda
    if (path !== "/") {
      return NextResponse.json({ ok: true, skipped: "not_homepage" });
    }

    // Periksa cookie sesi: jika sudah pernah tercatat pada sesi ini, jangan hitung ulang
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("psht_session_visited");
    if (sessionCookie) {
      return NextResponse.json({ ok: true, skipped: "already_visited_this_session" });
    }

    const userAgent = request.headers.get("user-agent") || null;

    // Dual-write: local resilient store + Supabase
    await recordLocalVisit(path, userAgent);

    const client = createOptionalSupabaseClient();
    if (client) {
      await client.from("site_visits").insert({
        path,
        user_agent: userAgent ? userAgent.slice(0, 255) : null,
      });
    }

    const response = NextResponse.json({ ok: true });
    // Pasang cookie sesi (berlaku hingga browser ditutup)
    response.cookies.set("psht_session_visited", "1", {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

