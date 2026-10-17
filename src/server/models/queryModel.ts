import { query, transaction } from "../models/databaseModel";

const tablesWithoutId = new Set(["points_table", "settings"]);

function toPostgresPlaceholders(sql: string): string {
  let position = 0;
  return sql.replace(/\?/g, () => `$${++position}`);
}

function addReturningId(sql: string): string {
  const insert = sql.match(/^\s*INSERT\s+INTO\s+([a-z_][a-z0-9_]*)/i);
  if (!insert || tablesWithoutId.has(insert[1].toLowerCase()) || /\bRETURNING\b/i.test(sql)) {
    return sql;
  }
  return `${sql.trimEnd()} RETURNING id`;
}

export const databaseService = {
  prepare(sql: string) {
    const postgresSql = toPostgresPlaceholders(sql);
    return {
      all: async (...values: unknown[]) => (await query(postgresSql, values)).rows,
      get: async (...values: unknown[]) => (await query(postgresSql, values)).rows[0],
      run: async (...values: unknown[]) => {
        const result = await query(addReturningId(postgresSql), values);
        return {
          lastInsertRowid: result.rows[0]?.id ?? null,
          changes: result.rowCount ?? 0,
        };
      },
    };
  },
  transaction<T>(operation: () => Promise<T>) {
    return () => transaction(operation);
  },
};
