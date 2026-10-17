import "dotenv/config";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { closeDatabase, initializeDatabase, query, transaction } from "../src/server/models/databaseModel";

const tableColumns: Record<string, string[]> = {
  users: ["id", "name", "email", "password", "plan", "is_admin", "created_at"],
  tournaments: ["id", "name", "sport", "format", "overs", "teams_count", "status", "is_auction_enabled", "base_budget", "sport_options", "start_date", "end_date", "rules", "created_at"],
  teams: ["id", "tournament_id", "name", "short_name", "logo_url", "manager_name", "payment_status", "status", "remaining_budget"],
  players: ["id", "team_id", "tournament_id", "name", "age", "role", "base_price", "sold_price", "is_sold", "image_url", "phone", "sport", "sport_details"],
  matches: ["id", "tournament_id", "team1_id", "team2_id", "venue", "match_date", "status", "winner_id", "toss_winner_id", "toss_decision", "current_innings", "live_stream_url", "striker_id", "non_striker_id", "bowler_id", "team1_score", "team2_score"],
  innings: ["id", "match_id", "innings_number", "batting_team_id", "bowling_team_id", "runs", "wickets", "overs_bowled"],
  balls: ["id", "innings_id", "over_number", "ball_number", "batsman_id", "bowler_id", "runs", "extras", "extra_type", "wicket_type", "wicket_player_id", "timestamp"],
  points_table: ["tournament_id", "team_id", "played", "won", "lost", "tied", "nrr", "points"],
  match_events: ["id", "match_id", "timestamp", "event_type", "team_id", "player_id", "description"],
  expenses: ["id", "tournament_id", "description", "amount", "category", "date"],
  products: ["id", "name", "category", "description", "price", "image_url", "selling_options", "stock", "created_at"],
  orders: ["id", "product_id", "customer_name", "customer_email", "customer_mobile", "customer_address", "quantity", "total_price", "status", "payment_method", "payment_details", "created_at"],
  grounds: ["id", "name", "location", "description", "price_per_hour", "image_url", "amenities", "created_at"],
  ground_bookings: ["id", "ground_id", "customer_name", "customer_email", "customer_mobile", "booking_date", "start_time", "end_time", "total_price", "status", "payment_method", "payment_details", "created_at"],
  sponsors: ["id", "tournament_id", "name", "website_url", "banner_url", "created_at"],
  settings: ["key", "value"],
  team_chats: ["id", "tournament_id", "sender_name", "team_name", "message", "created_at"],
  tournament_gallery: ["id", "tournament_id", "image_url", "caption", "created_at"],
  auction_invites: ["id", "tournament_id", "player_name", "email", "phone", "sport", "notes", "invite_code", "status", "registered_player_id", "created_at"],
};
const tableNames = Object.keys(tableColumns);
const numericFlagColumns = new Set(["is_admin", "is_auction_enabled", "is_sold"]);
const sourcePath = path.resolve(process.argv.find((arg) => !arg.startsWith("--") && arg.endsWith(".db")) ?? "tournament.db");
const apply = process.argv.includes("--apply");

function readSource(includeRows: boolean): Record<string, any> {
  const python = `
import json, sqlite3, sys
db = sqlite3.connect(sys.argv[1])
db.row_factory = sqlite3.Row
tables = json.loads(sys.argv[2])
include_rows = sys.argv[3] == "1"
result = {}
for table in tables:
    exists = db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone()
    if not exists:
        result[table] = {"columns": [], "rows": [], "count": 0}
        continue
    columns = [row["name"] for row in db.execute("PRAGMA table_info(" + table + ")")]
    count = db.execute("SELECT COUNT(*) FROM " + table).fetchone()[0]
    rows = [dict(row) for row in db.execute("SELECT * FROM " + table)] if include_rows else []
    result[table] = {"columns": columns, "rows": rows, "count": count}
print(json.dumps(result, separators=(",", ":")))
`;
  const args = ["-c", python, sourcePath, JSON.stringify(tableNames), includeRows ? "1" : "0"];
  let child = spawnSync(process.env.PYTHON || "python", args, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  if ((child.error as NodeJS.ErrnoException | undefined)?.code === "ENOENT" && !process.env.PYTHON) {
    child = spawnSync("py", args, { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  }
  if (child.error || child.status !== 0) {
    throw new Error("SQLite export failed. Ensure Python 3 and the SQLite file are available.");
  }
  return JSON.parse(child.stdout);
}

async function run() {
  const source = readSource(apply);
  const counts = Object.fromEntries(tableNames.map((table) => [table, source[table].count]));
  if (!apply) {
    console.log("Dry run only; no PostgreSQL connection or changes were made.");
    for (const [table, count] of Object.entries(counts)) console.log(`${table}: ${count} source rows`);
    console.log("Review the counts, configure DATABASE_URL outside this script, then rerun with --apply.");
    return;
  }

  await initializeDatabase();
  const totals: Record<string, { imported: number; skipped: number }> = {};
  for (const table of tableNames) {
    const allowed = tableColumns[table];
    const columns = source[table].columns.filter((column: string) => allowed.includes(column));
    if (!columns.length) {
      totals[table] = { imported: 0, skipped: source[table].count };
      continue;
    }
    let imported = 0;
    let skipped = 0;
    await transaction(async () => {
      for (const [index, row] of source[table].rows.entries()) {
        const savepoint = `sqlite_import_${index}`;
        await query(`SAVEPOINT ${savepoint}`);
        const values = columns.map((column: string) => {
          const value = row[column];
          if (!numericFlagColumns.has(column) || value === null || value === undefined) return value;
          return value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1" ? 1 : 0;
        });
        const placeholders = columns.map((_, position) => `$${position + 1}`).join(", ");
        try {
          const result = await query(
            `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values,
          );
          if (result.rowCount) imported++;
          else skipped++;
          await query(`RELEASE SAVEPOINT ${savepoint}`);
        } catch (error: any) {
          await query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
          await query(`RELEASE SAVEPOINT ${savepoint}`);
          if (error?.code === "23503") skipped++;
          else throw error;
        }
      }
    });
    if (columns.includes("id")) {
      await query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ${table}`,
      );
    }
    totals[table] = { imported, skipped };
  }
  for (const [table, result] of Object.entries(totals)) {
    console.log(`${table}: imported ${result.imported}, skipped ${result.skipped} (existing/conflicting or invalid rows)`);
  }
  console.log("Import complete. Existing PostgreSQL rows were never updated or deleted.");
}

run()
  .catch((error: any) => {
    console.error("SQLite import failed:", error?.code || "unexpected_error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
