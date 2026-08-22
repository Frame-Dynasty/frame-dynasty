import QRCode from "qrcode";
import { readFileSync } from "fs";
import { join } from "path";

function logoToBase64(): string {
  try {
    const buf = readFileSync(join(process.cwd(), "public", "logo.png"));
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

export async function generateStyledQR(url: string, accentColor?: string): Promise<{ svg: string; png: string }> {
  const qr = QRCode.create(url, {
    errorCorrectionLevel: "H" as const,
  });

  const size: number = qr.modules.size;
  const dotSize = 10;
  const padding = 3 * dotSize;
  const logoSize = 7 * dotSize;
  const totalSize = size * dotSize + padding * 2;
  const center = totalSize / 2;

  const color = accentColor || "#000000";
  const bgColor = "#ffffff";

  let modules = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.modules.get(row, col)) {
        const x = padding + col * dotSize;
        const y = padding + row * dotSize;
        const r = dotSize * 0.38;
        modules += `<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" rx="${r}" fill="${color}"/>`;
      }
    }
  }

  const logo = logoToBase64();
  const logoImg = logo
    ? `<circle cx="${center}" cy="${center}" r="${logoSize / 2 + 4}" fill="${bgColor}"/>
       <image href="${logo}" x="${center - logoSize / 2}" y="${center - logoSize / 2}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice"/>`
    : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
  <rect width="${totalSize}" height="${totalSize}" fill="${bgColor}" rx="12"/>
  ${modules}
  ${logoImg}
</svg>`;

  const png = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return { svg, png };
}
