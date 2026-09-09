import { NextResponse, type NextRequest } from "next/server";
import { createOptionalSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path.slice(0, 255) : "/";
    const userAgent = request.headers.get("user-agent") || null;

    const client = createOptionalSupabaseClient();
    if (client) {
      await client.from("site_visits").insert({
        path,
        user_agent: userAgent ? userAgent.slice(0, 255) : null,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
