import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET — list admins
export async function GET() {
  const admins = await query(
    "SELECT id, name, created_at FROM admins ORDER BY created_at DESC"
  );
  return NextResponse.json(admins);
}

// POST — create admin (superuser only)
export async function POST(request: Request) {
  const { name, password, created_by } = await request.json();

  if (!name || !password) {
    return NextResponse.json({ error: "name and password required" }, { status: 400 });
  }

  // Verify creator is superuser
  const creator = await queryOne<{ name: string }>(
    "SELECT name FROM admins WHERE name = $1",
    [created_by]
  );
  if (!creator || creator.name !== "superuser") {
    return NextResponse.json({ error: "Only superuser can create admins" }, { status: 403 });
  }

  const existing = await queryOne(
    "SELECT id FROM admins WHERE name = $1",
    [name]
  );
  if (existing) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  await query(
    "INSERT INTO admins (name, password_hash) VALUES ($1, $2)",
    [name, hash]
  );

  return NextResponse.json({ ok: true });
}

// DELETE — remove admin (superuser only, cannot delete self)
export async function DELETE(request: Request) {
  const { id, admin_name } = await request.json();

  if (!id || !admin_name) {
    return NextResponse.json({ error: "id and admin_name required" }, { status: 400 });
  }

  const creator = await queryOne<{ name: string }>(
    "SELECT name FROM admins WHERE name = $1",
    [admin_name]
  );
  if (!creator || creator.name !== "superuser") {
    return NextResponse.json({ error: "Only superuser can delete admins" }, { status: 403 });
  }

  const target = await queryOne<{ name: string }>(
    "SELECT name FROM admins WHERE id = $1",
    [id]
  );
  if (target?.name === "superuser") {
    return NextResponse.json({ error: "Cannot delete superuser" }, { status: 403 });
  }

  await query("DELETE FROM admins WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
