import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { generateStyledQR } from "@/lib/qr";

interface Frame {
  id: string;
  accent_color: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const frameId = searchParams.get("id");
  const format = searchParams.get("format") || "svg";

  if (!frameId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const frame = await queryOne<Frame>(
    "SELECT id, accent_color FROM frames WHERE id = $1",
    [frameId]
  );

  if (!frame) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  const url = `https://framedynasty.com.ng/f/${frame.id}`;
  const qr = await generateStyledQR(url, frame.accent_color || undefined);

  if (format === "png") {
    return new NextResponse(qr.png.split(",")[1], {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${frame.id}.svg"`,
      },
    });
  }

  return new NextResponse(qr.svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="qr-${frame.id}.svg"`,
    },
  });
}
