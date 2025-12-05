import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/mainstory_library";

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);

