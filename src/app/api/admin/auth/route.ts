import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { name, password } = await request.json();

  if (!name || !password) {
    return NextResponse.json({ error: "Name and password required" }, { status: 400 });
  }

  const admin = await queryOne<{ name: string; password_hash: string }>(
    "SELECT name, password_hash FROM admins WHERE name = $1",
    [name]
  );

  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
