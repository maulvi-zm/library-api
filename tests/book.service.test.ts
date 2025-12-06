import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	mock,
	setDefaultTimeout,
	test,
} from "bun:test";

setDefaultTimeout(1000);

let originalDatabaseUrl: string | undefined;
let stopTestDB: (() => Promise<void>) | null = null;
let BookService: typeof import("../src/modules/books/service");
let cleanupDatabase: () => Promise<void>;

describe("BookService Integration Tests", () => {
	beforeAll(async () => {
		originalDatabaseUrl = process.env.DATABASE_URL;

		const { setupTestDB, cleanupDatabase: cleanup } = await import("./setup");
		const testDB = await setupTestDB();
		stopTestDB = testDB.stop;
		cleanupDatabase = cleanup;

		process.env.DATABASE_URL = "pglite://memory";

		mock.module("../src/db/client", () => {
			return {
				db: testDB.db,
			};
		});

		BookService = await import("../src/modules/books/service");
	});

	afterEach(async () => {
		await cleanupDatabase();
	});

	afterAll(async () => {
		if (stopTestDB) {
			await stopTestDB();
		}
		if (originalDatabaseUrl !== undefined) {
			process.env.DATABASE_URL = originalDatabaseUrl;
		}
	});

	test("should create a book", async () => {
		const book = await BookService.create({
			name: "Test Book",
			author: "Test Author",
			publishedYear: 2023,
			description: "Test Description",
		});

		expect(book).toBeDefined();
		expect(book.name).toBe("Test Book");
		expect(book.author).toBe("Test Author");
		expect(book.publishedYear).toBe(2023);
		expect(book.description).toBe("Test Description");
		expect(book.id).toBeGreaterThan(0);
	});

	test("should get all books", async () => {
		await BookService.create({
			name: "Book 1",
			author: "Author 1",
		});
		await BookService.create({
			name: "Book 2",
			author: "Author 2",
		});

		const result = await BookService.list({});

		expect(result).toBeDefined();
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBe(2);
		expect(result.pagination).toBeDefined();
		expect(result.pagination.totalItems).toBe(2);
	});

	test("should get book by id", async () => {
		const created = await BookService.create({
			name: "Get By Id Book",
			author: "Author",
		});

		const book = await BookService.getById(created.id);

		expect(book).toBeDefined();
		expect(book.id).toBe(created.id);
		expect(book.name).toBe("Get By Id Book");
	});

	test("should update a book", async () => {
		const created = await BookService.create({
			name: "Original Name",
			author: "Original Author",
		});

		const updated = await BookService.update(created.id, {
			name: "Updated Name",
			author: "Updated Author",
		});

		expect(updated).toBeDefined();
		expect(updated.id).toBe(created.id);
		expect(updated.name).toBe("Updated Name");
		expect(updated.author).toBe("Updated Author");
	});

	test("should delete a book", async () => {
		const created = await BookService.create({
			name: "Book To Delete",
			author: "Author",
		});

		const result = await BookService.deleteBook(created.id);

		expect(result.success).toBe(true);

		expect(BookService.getById(created.id)).rejects.toMatchObject({
			code: 404,
		});
	});

	test("should throw error when creating duplicate book name", async () => {
		await BookService.create({
			name: "Duplicate Test",
			author: "Author",
		});

		expect(
			BookService.create({
				name: "Duplicate Test",
				author: "Another Author",
			}),
		).rejects.toMatchObject({ code: 409 });
	});

	test("should throw error when book not found", async () => {
		expect(BookService.getById(99999)).rejects.toMatchObject({ code: 404 });
	});
});
