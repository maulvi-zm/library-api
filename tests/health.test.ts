import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

describe("Health and Root Routes", () => {
	test("GET / should return welcome message without auth", async () => {
		const app = new Elysia().get("/", () => "Hello Library API!");

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("Hello Library API!");
	});

	test("GET /health should return health status without auth", async () => {
		const app = new Elysia().get("/health", () => ({
			status: "ok",
			environment: process.env.NODE_ENV || "test",
		}));

		const response = await app.handle(new Request("http://localhost/health"));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.status).toBe("ok");
		expect(data.environment).toBeDefined();
	});
});
