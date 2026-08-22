import { NextResponse } from "next/server";

const R2_PUBLIC = process.env.R2_PUBLIC_URL || "https://pub-6ff7acfeb6774783bdea82b8fa66e289.r2.dev";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  const url = `${R2_PUBLIC}/${path}`;
  const range = request.headers.get("range");

  const headers: Record<string, string> = {};
  if (range) headers["Range"] = range;

  const res = await fetch(url, { headers });

  const responseHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const contentType = res.headers.get("content-type");
  if (contentType) responseHeaders["Content-Type"] = contentType;

  const contentLength = res.headers.get("content-length");
  if (contentLength) responseHeaders["Content-Length"] = contentLength;

  const contentRange = res.headers.get("content-range");
  if (contentRange) responseHeaders["Content-Range"] = contentRange;

  const acceptRanges = res.headers.get("accept-ranges");
  if (acceptRanges) responseHeaders["Accept-Ranges"] = acceptRanges;

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
    },
  });
}
