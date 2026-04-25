// Entry point for TypeORM CLI commands (migration:run, migration:generate, etc.)
// Bun auto-loads .env, so we can import AppDataSource directly.
import { AppDataSource } from "./config/database";

export default AppDataSource;
