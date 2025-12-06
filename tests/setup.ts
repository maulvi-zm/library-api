import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema";

let pgLite: PGlite | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function setupTestDB(): Promise<{
	db: ReturnType<typeof drizzle<typeof schema>>;
	stop: () => Promise<void>;
}> {
	if (!pgLite) {
		pgLite = new PGlite();
		await pgLite.waitReady;
	}

	if (!dbInstance) {
		dbInstance = drizzle(pgLite, { schema });

		await migrate(dbInstance, {
			migrationsFolder: join(import.meta.dir, "..", "drizzle"),
		});
	}

	return {
		db: dbInstance,
		stop: async () => {
			if (pgLite) {
				await pgLite.close();
				pgLite = null;
				dbInstance = null;
			}
		},
	};
}

export async function cleanupDatabase() {
	if (dbInstance) {
		await dbInstance.execute(sql`DELETE FROM books`);
		await dbInstance.execute(sql`ALTER SEQUENCE books_id_seq RESTART WITH 1`);
	}
}

export function getTestDb() {
	if (!dbInstance) {
		throw new Error("Test database not initialized");
	}
	return dbInstance;
}
