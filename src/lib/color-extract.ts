/**
 * Extract dominant color from an image using canvas sampling.
 * Ponytail: brute-force pixel sampling, fast enough for a single image on upload.
 */
export function extractDominantColor(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#FFC825";

  const size = 64; // ponytail: small sample = fast
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;

  // Count color buckets (quantize to reduce noise)
  const buckets: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 16) {
    // sample every 4th pixel
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }

  // Find most common, skip near-black and near-white
  let best = "";
  let bestCount = 0;
  for (const [key, count] of Object.entries(buckets)) {
    const [r, g, b] = key.split(",").map(Number);
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 225) continue; // skip extremes
    if (count > bestCount) {
      bestCount = count;
      best = key;
    }
  }

  if (!best) return "#FFC825";

  const [r, g, b] = best.split(",").map(Number);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
