import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { auth } from "../src/middleware/auth";

describe("Auth Middleware", () => {
	const originalEnv = process.env.STATIC_TOKEN;

	beforeEach(() => {
		process.env.STATIC_TOKEN = "test-token-123";
	});

	afterEach(() => {
		process.env.STATIC_TOKEN = originalEnv;
	});

	it("should allow request with valid Bearer token", async () => {
		const app = new Elysia().use(auth).get("/test", () => "success");

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					authorization: "Bearer test-token-123",
				},
			}),
		);

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toBe("success");
	});

	it("shouldn't allow request with no authorization header", async () => {
		const app = new Elysia().use(auth).get("/test", () => "success");

		const response = await app.handle(new Request("http://localhost/test"));

		expect(response.status).toBe(401);
		const text = await response.text();
		expect(text).toBe("Unauthorized: Missing Authorization header");
	});

	it("shouldn't allow request with invalid authorization type", async () => {
		const app = new Elysia().use(auth).get("/test", () => "success");

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					authorization: "Basic test-token-123",
				},
			}),
		);

		expect(response.status).toBe(401);
		const text = await response.text();
		expect(text).toBe("Unauthorized: Invalid Authorization header format");
	});

	it("shouldn't allow request with invalid authorization token", async () => {
		const app = new Elysia().use(auth).get("/test", () => "success");

		const response = await app.handle(
			new Request("http://localhost/test", {
				headers: {
					authorization: "Bearer test-token-999",
				},
			}),
		);

		expect(response.status).toBe(401);
		const text = await response.text();
		expect(text).toBe("Unauthorized: Invalid token");
	});
});
