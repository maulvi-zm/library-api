import { t } from "elysia";

export namespace BookModel {
	export const createBody = t.Object({
		name: t.String({ minLength: 1 }),
		author: t.String({ minLength: 1 }),
		publishedYear: t.Optional(t.Number({ minimum: 0, maximum: 2100 })),
		description: t.Optional(t.String()),
	});

	export type createBody = typeof createBody.static;

	export const updateBody = t.Object({
		name: t.Optional(t.String({ minLength: 1 })),
		author: t.Optional(t.String({ minLength: 1 })),
		publishedYear: t.Optional(t.Number({ minimum: 0, maximum: 2100 })),
		description: t.Optional(t.String()),
	});

	export type updateBody = typeof updateBody.static;

	export const queryParams = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		pageSize: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
		offset: t.Optional(t.Number({ minimum: 0 })),
	});

	export type queryParams = typeof queryParams.static;

	export const book = t.Object({
		id: t.Number(),
		name: t.String(),
		author: t.String(),
		publishedYear: t.Nullable(t.Number()),
		description: t.Nullable(t.String()),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	});

	export type book = typeof book.static;

	export const pagination = t.Object({
		page: t.Number(),
		pageSize: t.Number(),
		totalItems: t.Number(),
		totalPages: t.Number(),
	});

	export type pagination = typeof pagination.static;

	export const listResponse = t.Object({
		data: t.Array(book),
		pagination,
	});

	export type listResponse = typeof listResponse.static;

	// Error responses
	export const duplicateNameError = t.Literal(
		"Book with this name already exists",
	);
	export type duplicateNameError = typeof duplicateNameError.static;

	export const notFoundError = t.Literal("Book not found");
	export type notFoundError = typeof notFoundError.static;
}
