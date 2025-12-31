import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { books } from "./modules/books";
import { logger } from "./utils/logger";

const app = new Elysia();

if (env.NODE_ENV === "production") {
	app.use(
		cors({
			origin: /^https:\/\/.*\.example\.com$/,
			credentials: true,
		}),
	);
} else {
	app.use(
		cors({
			origin: true,
			credentials: true,
		}),
	);
}

// OpenAPI docs: only enable in non-production environments
if (env.NODE_ENV !== "production") {
	app.use(openapi());
	logger.info("OpenAPI documentation enabled");
}

app
	.get("/", () => "Hello Library API!")
	.get("/health", () => ({ status: "ok", environment: env.NODE_ENV }))
	.use(books)
	.listen(env.PORT);

logger.info(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} (${env.NODE_ENV})`,
);
