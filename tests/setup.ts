import { PGlite } from "@electric-sql/pglite";
import { initializeTestDb } from "./db-client";
import { setSharedPGlite } from "./pglite-shared";

export async function setupTestDB(): Promise<{
	connectionString: string;
	stop: () => Promise<void>;
}> {
	try {
		const pgLite = new PGlite();

		await pgLite.waitReady;

		setSharedPGlite(pgLite);

		await initializeTestDb();

		const connectionString = "pglite://memory";

		return {
			connectionString,
			stop: async () => {
				await pgLite.close();
				setSharedPGlite(null);
			},
		};
	} catch (error) {
		console.error("Failed to setup test database:", error);
		throw error;
	}
}
