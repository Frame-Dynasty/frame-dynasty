import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { frameId } = await request.json();

    if (!frameId || typeof frameId !== "string") {
      return NextResponse.json({ error: "Invalid frameId" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "";

    // ponytail: fire-and-forget — don't await in the page, but here in the API route we just insert and return
    await query(
      "INSERT INTO scan_events (frame_id, user_agent) VALUES ($1, $2)",
      [frameId, userAgent]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // don't expose errors to client
  }
}
