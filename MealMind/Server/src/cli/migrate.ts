import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");

function connectionConfig(): mysql.ConnectionOptions {
  const host = process.env.MYSQL_HOST ?? "127.0.0.1";
  const port = Number.parseInt(process.env.MYSQL_PORT ?? "3306", 10);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE;

  if (!user || user === "") {
    throw new Error("MYSQL_USER is required to run migrations (see server/.env.example).");
  }
  if (!database || database === "") {
    throw new Error("MYSQL_DATABASE is required to run migrations (see server/.env.example).");
  }
  if (!Number.isFinite(port)) {
    throw new Error(`Invalid MYSQL_PORT: ${process.env.MYSQL_PORT}`);
  }

  return {
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  };
}

async function main(): Promise<void> {
  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No .sql files in migrations/");
    return;
  }

  const conn = await mysql.createConnection(connectionConfig());

  try {
    await conn.query(`
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

    for (const file of files) {
      const version = file.replace(/\.sql$/i, "");
      const [rows] = await conn.query(
        "SELECT 1 AS ok FROM schema_migrations WHERE version = ? LIMIT 1",
        [version],
      );

      if (!Array.isArray(rows)) {
        throw new Error("Unexpected result from schema_migrations query");
      }
      if (rows.length > 0) {
        console.log(`Skip ${file} (already applied)`);
        continue;
      }

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`Apply ${file} ...`);
      await conn.query(sql);
      await conn.query("INSERT INTO schema_migrations (version) VALUES (?)", [version]);
      console.log(`Applied ${file}`);
    }
  } finally {
    await conn.end();
  }

  console.log("Migrations finished.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
