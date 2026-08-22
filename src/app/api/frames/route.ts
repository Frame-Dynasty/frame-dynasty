import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";
import { generateStyledQR } from "@/lib/qr";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 7);

export async function GET() {
  const frames = await query(
    "SELECT id, title, story, image_url, blur_data, supplement_images, credits, accent_color, created_at FROM frames ORDER BY created_at DESC"
  );
  return NextResponse.json(frames);
}

export async function POST(request: Request) {
  const { title, story, image_url, blur_data, supplement_images, credits, accent_color, admin_name } =
    await request.json();

  if (!title || !story || !image_url) {
    return NextResponse.json(
      { error: "title, story, image_url required" },
      { status: 400 }
    );
  }

  const id = nanoid();
  const supImages = supplement_images?.length ? supplement_images.slice(0, 10) : [];
  const allCredits = credits?.length ? credits : [];

  await query(
    `INSERT INTO frames (id, title, story, image_url, blur_data, supplement_images, credits, accent_color, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, title, story, image_url, blur_data || null, JSON.stringify(supImages), JSON.stringify(allCredits), accent_color || null, admin_name || null]
  );

  const url = `https://framedynasty.com.ng/f/${id}`;
  const qr = await generateStyledQR(url, accent_color);

  return NextResponse.json({ id, url, qrPng: qr.png, qrSvg: qr.svg });
}

export async function PUT(request: Request) {
  const { id, title, story, image_url, blur_data, supplement_images, credits, accent_color, admin_name } =
    await request.json();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supImages = supplement_images !== undefined
    ? (supplement_images?.length ? supplement_images.slice(0, 10) : [])
    : undefined;
  const allCredits = credits !== undefined ? credits : undefined;

  await query(
    `UPDATE frames SET title = COALESCE($2, title), story = COALESCE($3, story),
     image_url = COALESCE($4, image_url), blur_data = $5,
     supplement_images = COALESCE($6, supplement_images),
     credits = COALESCE($7, credits), accent_color = $8, updated_by = $9
     WHERE id = $1`,
    [
      id, title, story, image_url,
      blur_data || null,
      supImages ? JSON.stringify(supImages) : null,
      allCredits !== undefined ? JSON.stringify(allCredits) : null,
      accent_color || null, admin_name || null,
    ]
  );

  const url = `https://framedynasty.com.ng/f/${id}`;
  const qr = await generateStyledQR(url, accent_color);

  return NextResponse.json({ id, url, qrPng: qr.png, qrSvg: qr.svg });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await query("DELETE FROM frames WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
