import { query } from "./db";
import bcrypt from "bcryptjs";

async function seed() {
  const name = "superuser";
  const password = "frame2026";
  const hash = await bcrypt.hash(password, 10);

  await query(
    `INSERT INTO admins (name, password_hash) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
    [name, hash]
  );

  console.log(`Admin seeded: ${name} / ${password}`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
