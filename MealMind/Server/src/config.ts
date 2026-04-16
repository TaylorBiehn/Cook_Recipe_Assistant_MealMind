import "dotenv/config";

function readPort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return 3000;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return n;
}

export const config = {
  port: readPort(),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
