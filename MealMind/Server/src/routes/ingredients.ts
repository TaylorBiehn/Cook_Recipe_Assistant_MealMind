import { Router } from "express";
import mysql from "mysql2/promise";
import { getAuthSubjectFromAuthorizationHeader } from "../auth/subject.js";
import { ingredientRecentUpsertSchema } from "../contracts/ingredient.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validateBody.js";

const router = Router();

let pool: mysql.Pool | null = null;
let defaultUserId: number | null = null;

function connectionConfig(): mysql.PoolOptions {
  const host = process.env.MYSQL_HOST ?? "127.0.0.1";
  const port = Number.parseInt(process.env.MYSQL_PORT ?? "3306", 10);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE;

  if (!user || !database || !Number.isFinite(port)) {
    throw new HttpError(
      503,
      "DB_NOT_CONFIGURED",
      "Recent ingredients require MySQL configuration (MYSQL_USER, MYSQL_DATABASE).",
    );
  }

  return { host, port, user, password, database, connectionLimit: 5 };
}

function getPool(): mysql.Pool {
  if (pool == null) {
    pool = mysql.createPool(connectionConfig());
  }
  return pool;
}

async function getOrCreateDefaultUserId(p: mysql.Pool): Promise<number> {
  if (defaultUserId != null) {
    return defaultUserId;
  }
  const [insertResult] = await p.execute<mysql.ResultSetHeader>(
    "INSERT INTO users (auth_subject) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
    ["local-default-user"],
  );
  defaultUserId = Number(insertResult.insertId);
  return defaultUserId;
}

async function getOrCreateUserIdForRequest(req: { headers: Record<string, string | string[] | undefined> }, p: mysql.Pool): Promise<number> {
  const rawAuthorization = req.headers.authorization;
  const authorizationHeader = Array.isArray(rawAuthorization) ? rawAuthorization[0] : rawAuthorization;
  const authSubject = getAuthSubjectFromAuthorizationHeader(authorizationHeader);
  if (!authSubject) {
    return getOrCreateDefaultUserId(p);
  }
  const [insertResult] = await p.execute<mysql.ResultSetHeader>(
    "INSERT INTO users (auth_subject) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
    [authSubject],
  );
  return Number(insertResult.insertId);
}

function normalizeIngredients(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const cleaned = item.trim().replace(/\s+/g, " ");
    if (cleaned.length === 0) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

router.get(
  "/recent",
  asyncHandler(async (req, res) => {
    const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const limitNum = Number.parseInt(typeof limitRaw === "string" ? limitRaw : "20", 10);
    const limit = Number.isFinite(limitNum) ? Math.max(1, Math.min(100, limitNum)) : 20;

    const p = getPool();
    const userId = await getOrCreateUserIdForRequest(req, p);
    const [rows] = await p.query<mysql.RowDataPacket[]>(
      `SELECT ingredient_name, last_used_at, use_count
       FROM ingredient_history
       WHERE user_id = ?
       ORDER BY last_used_at DESC, id DESC
       LIMIT ?`,
      [userId, limit],
    );

    res.status(200).json({
      data: {
        ingredients: rows.map((row) => ({
          name: String(row.ingredient_name),
          lastUsedAt: new Date(String(row.last_used_at)).toISOString(),
          useCount: Number(row.use_count) || 1,
        })),
      },
    });
  }),
);

router.post(
  "/recent",
  validateBody(ingredientRecentUpsertSchema),
  asyncHandler(async (req, res) => {
    const normalized = normalizeIngredients(req.body.ingredients as string[]);
    if (normalized.length === 0) {
      res.status(200).json({ data: { saved: 0 } });
      return;
    }
    const p = getPool();
    const userId = await getOrCreateUserIdForRequest(req, p);
    const conn = await p.getConnection();
    try {
      await conn.beginTransaction();
      for (const name of normalized) {
        await conn.query(
          `INSERT INTO ingredient_history (user_id, ingredient_name, ingredient_key, last_used_at, use_count)
           VALUES (?, ?, LOWER(?), CURRENT_TIMESTAMP, 1)
           ON DUPLICATE KEY UPDATE last_used_at = CURRENT_TIMESTAMP, use_count = use_count + 1, ingredient_name = VALUES(ingredient_name)`,
          [userId, name, name],
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.status(200).json({ data: { saved: normalized.length } });
  }),
);

export const ingredientsRouter = router;
