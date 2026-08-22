import { AwsClient } from "aws4fetch";
import { nanoid } from "nanoid";

const r2 = new AwsClient({
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  region: "auto",
});

const BUCKET = "framedynasty";
const PUBLIC_URL = "https://pub-6ff7acfeb6774783bdea82b8fa66e289.r2.dev";
const ENDPOINT = "https://92422e22ac11b09ca1b5fd9337401b56.r2.cloudflarestorage.com";

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `frames/${nanoid(8)}.${ext}`;

  const body = await file.arrayBuffer();

  const res = await r2.fetch(`${ENDPOINT}/${BUCKET}/${key}`, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": file.type || `image/${ext}`,
      "Content-Length": body.byteLength.toString(),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${text}`);
  }

  return `/${key}`;
}
