import {
	afterAll,
	beforeAll,
	describe,
	expect,
	mock,
	setDefaultTimeout,
	test,
} from "bun:test";
import { Elysia } from "elysia";

setDefaultTimeout(1000);

let originalDatabaseUrl: string | undefined;
let originalStaticToken: string | undefined;
let stopTestDB: (() => Promise<void>) | null = null;
let books: typeof import("../src/modules/books").books;

describe("Book Routes Integration Tests", () => {
	beforeAll(async () => {
		originalDatabaseUrl = process.env.DATABASE_URL;
		originalStaticToken = process.env.STATIC_TOKEN;

		const dbClientModule = await import("./db-client");
		dbClientModule.resetDbInstance?.();

		const { setupTestDB } = await import("./setup");
		const testDB = await setupTestDB();
		stopTestDB = testDB.stop;

		process.env.DATABASE_URL = testDB.connectionString;
		process.env.STATIC_TOKEN = "test";

		const testDb = await dbClientModule.initializeTestDb();

		mock.module("../src/db/client", () => {
			return {
				db: testDb,
			};
		});

		const booksModule = await import("../src/modules/books");
		books = booksModule.books;
	});

	afterAll(async () => {
		if (stopTestDB) {
			await stopTestDB();
		}
		if (originalDatabaseUrl !== undefined) {
			process.env.DATABASE_URL = originalDatabaseUrl;
		}
		if (originalStaticToken !== undefined) {
			process.env.STATIC_TOKEN = originalStaticToken;
		}
	});

	test("POST /books should create a book", async () => {
		const app = new Elysia().use(books);

		const response = await app.handle(
			new Request("http://localhost/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "Route Test Book",
					author: "Route Test Author",
					publishedYear: 2023,
					description: "Route Test Description",
				}),
			}),
		);

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data.name).toBe("Route Test Book");
		expect(data.author).toBe("Route Test Author");
		expect(data.id).toBeGreaterThan(0);
	});

	test("GET /books should return list of books", async () => {
		const app = new Elysia().use(books);

		await app.handle(
			new Request("http://localhost/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "List Test Book 1",
					author: "Author 1",
				}),
			}),
		);

		await app.handle(
			new Request("http://localhost/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "List Test Book 2",
					author: "Author 2",
				}),
			}),
		);

		const response = await app.handle(
			new Request("http://localhost/books", {
				headers: {
					authorization: "Bearer test",
				},
			}),
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toBeDefined();
		expect(data.data).toBeInstanceOf(Array);
		expect(data.pagination).toBeDefined();
		expect(data.pagination.totalItems).toBeGreaterThanOrEqual(2);
	});

	test("GET /books/:id should return a book", async () => {
		const app = new Elysia().use(books);

		const createResponse = await app.handle(
			new Request("http://localhost/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "Get By Id Route Test",
					author: "Author",
				}),
			}),
		);

		const created = await createResponse.json();

		const response = await app.handle(
			new Request(`http://localhost/books/${created.id}`, {
				headers: {
					authorization: "Bearer test",
				},
			}),
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.id).toBe(created.id);
		expect(data.name).toBe("Get By Id Route Test");
	});

	test("PUT /books/:id should update a book", async () => {
		const app = new Elysia().use(books);

		const createResponse = await app.handle(
			new Request("http://localhost/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "Original Route Name",
					author: "Original Author",
				}),
			}),
		);

		const created = await createResponse.json();

		const updateResponse = await app.handle(
			new Request(`http://localhost/books/${created.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "Updated Route Name",
					author: "Updated Author",
				}),
			}),
		);

		expect(updateResponse.status).toBe(200);
		const data = await updateResponse.json();
		expect(data.id).toBe(created.id);
		expect(data.name).toBe("Updated Route Name");
		expect(data.author).toBe("Updated Author");
	});

	test("DELETE /books/:id should delete a book", async () => {
		const app = new Elysia().use(books);

		const createResponse = await app.handle(
			new Request("http://localhost/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer test",
				},
				body: JSON.stringify({
					name: "Delete Route Test",
					author: "Author",
				}),
			}),
		);

		const created = await createResponse.json();

		const deleteResponse = await app.handle(
			new Request(`http://localhost/books/${created.id}`, {
				method: "DELETE",
				headers: {
					authorization: "Bearer test",
				},
			}),
		);

		expect(deleteResponse.status).toBe(200);
		const deleteData = await deleteResponse.json();
		expect(deleteData.success).toBe(true);

		const getResponse = await app.handle(
			new Request(`http://localhost/books/${created.id}`, {
				headers: {
					authorization: "Bearer test",
				},
			}),
		);

		expect(getResponse.status).toBe(404);
	});

	test("should return 401 without authorization header", async () => {
		const app = new Elysia().use(books);

		const response = await app.handle(
			new Request("http://localhost/books", {
				method: "GET",
			}),
		);

		expect(response.status).toBe(401);
	});

	test("should return 401 with invalid token", async () => {
		const app = new Elysia().use(books);

		const response = await app.handle(
			new Request("http://localhost/books", {
				method: "GET",
				headers: {
					authorization: "Bearer invalid-token",
				},
			}),
		);

		expect(response.status).toBe(401);
	});
});
