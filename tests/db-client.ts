import { join } from "node:path";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import * as schema from "../src/db/schema";
import { getSharedPGlite } from "./pglite-shared";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let currentPGliteInstance: any = null;

export async function initializeTestDb(): Promise<
	ReturnType<typeof drizzle<typeof schema>>
> {
	const sharedPGlite = getSharedPGlite();
	if (!sharedPGlite) {
		throw new Error(
			"PGlite instance not found. Make sure setupTestDB() is called first.",
		);
	}

	if (dbInstance && currentPGliteInstance !== sharedPGlite) {
		dbInstance = null;
	}

	if (dbInstance) {
		return dbInstance;
	}

	currentPGliteInstance = sharedPGlite;
	dbInstance = drizzle(sharedPGlite, { schema });

	await migrate(dbInstance, {
		migrationsFolder: join(import.meta.dir, "..", "drizzle"),
	});

	return dbInstance;
}

export function resetDbInstance() {
	dbInstance = null;
	currentPGliteInstance = null;
}

function getDb() {
	if (!dbInstance) {
		throw new Error(
			"Test database not initialized. Make sure setupTestDB() is called first.",
		);
	}
	return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
	get(_target, prop) {
		const db = getDb();
		const value = db[prop as keyof typeof db];

		if (typeof value === "function") {
			return value.bind(db);
		}
		return value;
	},
});
