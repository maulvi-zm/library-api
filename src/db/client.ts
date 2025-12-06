import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";

const connectionConfig: postgres.Options<Record<string, never>> = {
	prepare: false,
	...(env.NODE_ENV === "production"
		? {
				max: 20,
				idle_timeout: 20,
				connect_timeout: 10,
			}
		: env.NODE_ENV === "test"
			? {
					max: 1,
				}
			: {
					max: 10,
					idle_timeout: 30,
				}),
};

const client = postgres(env.DATABASE_URL, connectionConfig);

export const db = drizzle(client);
