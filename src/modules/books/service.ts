import * as drizzleOrm from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db/client";
import { books } from "../../db/schema";
import type { BookModel } from "./model";

export async function list(params: BookModel.queryParams) {
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? params.limit ?? 10;
	const offset = params.offset ?? (page - 1) * pageSize;

	const [data, totalResult] = await Promise.all([
		db.select().from(books).orderBy(books.name).limit(pageSize).offset(offset),
		db.select({ count: drizzleOrm.count() }).from(books),
	]);

	const totalItems = totalResult[0]?.count ?? 0;
	const totalPages = Math.ceil(totalItems / pageSize);

	return {
		data,
		pagination: {
			page,
			pageSize,
			totalItems,
			totalPages,
		},
	};
}

export async function getById(id: number) {
	const [book] = await db
		.select()
		.from(books)
		.where(drizzleOrm.eq(books.id, id))
		.limit(1);

	if (!book) {
		throw status(404, "Book not found" satisfies BookModel.notFoundError);
	}

	return book;
}

export async function create(body: BookModel.createBody) {
	// Check for duplicate name
	const [existing] = await db
		.select()
		.from(books)
		.where(drizzleOrm.eq(books.name, body.name))
		.limit(1);

	if (existing) {
		throw status(
			409,
			"Book with this name already exists" satisfies BookModel.duplicateNameError,
		);
	}

	const [newBook] = await db
		.insert(books)
		.values({
			name: body.name,
			author: body.author,
			publishedYear: body.publishedYear ?? null,
			description: body.description ?? null,
		})
		.returning();

	return newBook;
}

export async function update(id: number, body: BookModel.updateBody) {
	// Check if book exists
	const [existing] = await db
		.select()
		.from(books)
		.where(drizzleOrm.eq(books.id, id))
		.limit(1);

	if (!existing) {
		throw status(404, "Book not found" satisfies BookModel.notFoundError);
	}

	// Check for duplicate name if name is being updated
	if (body.name && body.name !== existing.name) {
		const [duplicate] = await db
			.select()
			.from(books)
			.where(drizzleOrm.eq(books.name, body.name))
			.limit(1);

		if (duplicate) {
			throw status(
				409,
				"Book with this name already exists" satisfies BookModel.duplicateNameError,
			);
		}
	}

	const [updated] = await db
		.update(books)
		.set({
			...body,
			updatedAt: drizzleOrm.sql`now()`,
		})
		.where(drizzleOrm.eq(books.id, id))
		.returning();

	return updated;
}

export async function deleteBook(id: number) {
	const [existing] = await db
		.select()
		.from(books)
		.where(drizzleOrm.eq(books.id, id))
		.limit(1);

	if (!existing) {
		throw status(404, "Book not found" satisfies BookModel.notFoundError);
	}

	await db.delete(books).where(drizzleOrm.eq(books.id, id));

	return { success: true };
}
