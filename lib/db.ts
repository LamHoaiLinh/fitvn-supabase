import { Pool, type QueryResultRow } from 'pg';
import { requireDatabaseUrl } from './env';

declare global {
  // Giữ pool qua hot reload trong dev để tránh mở quá nhiều kết nối.
  // eslint-disable-next-line no-var
  var fitvnPgPool: Pool | undefined;
}

export function getPool() {
  if (!global.fitvnPgPool) {
    global.fitvnPgPool = new Pool({
      connectionString: requireDatabaseUrl(),
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return global.fitvnPgPool;
}

export async function db<T extends QueryResultRow = any>(text: string, params: unknown[] = []) {
  try {
    return await getPool().query<T>(text, params);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu.';
    throw new Error(`Lỗi PostgreSQL: ${message}`);
  }
}

export async function tx<T>(fn: (client: import('pg').PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
