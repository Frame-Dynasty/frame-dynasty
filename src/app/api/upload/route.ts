import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/r2";

const IMAGE_EXTS = /\.(jpe?g|png|webp|avif|gif|bmp|svg)$/i;
const AUDIO_EXTS = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/") || IMAGE_EXTS.test(file.name);
    const isAudio = file.type.startsWith("audio/") || AUDIO_EXTS.test(file.name);

    if (!isImage && !isAudio) {
      return NextResponse.json({ error: "File must be an image or audio" }, { status: 400 });
    }

    const maxSize = isAudio ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${isAudio ? "50MB" : "10MB"})` }, { status: 400 });
    }

    const url = await uploadImage(file);
    return NextResponse.json({ url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
