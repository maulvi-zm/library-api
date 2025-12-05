import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { books } from "./modules/books";

const app = new Elysia()
	.use(openapi())
	.get("/", () => "Hello Library API!")
	.use(books)
	.listen(env.PORT);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
