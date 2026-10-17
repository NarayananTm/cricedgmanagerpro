import "dotenv/config";
import { closeDatabase, initializeDatabase } from "../src/server/models/databaseModel";

try {
  await initializeDatabase();
  console.log("PostgreSQL schema is up to date.");
} catch (error: any) {
  console.error("PostgreSQL migration failed:", error?.code || "unexpected_error");
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
