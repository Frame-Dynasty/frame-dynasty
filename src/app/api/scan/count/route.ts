import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const frameId = searchParams.get("frameId");

  if (!frameId) {
    return NextResponse.json({ count: 0 });
  }

  const result = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM scan_events WHERE frame_id = $1",
    [frameId]
  );

  return NextResponse.json({ count: parseInt(result?.count || "0", 10) });
}
