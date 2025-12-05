import { Elysia, t } from "elysia";
import { auth } from "../../middleware/auth";
import { BookModel } from "./model";
import * as BookService from "./service";

export const books = new Elysia({ prefix: "/books" })
	.use(auth)
	.get(
		"/",
		async ({ query }) => {
			return BookService.list(query);
		},
		{
			query: BookModel.queryParams,
			response: {
				200: BookModel.listResponse,
			},
		},
	)
	.get(
		"/:id",
		async ({ params }) => {
			return BookService.getById(params.id);
		},
		{
			params: t.Object({
				id: t.Numeric(),
			}),
			response: {
				200: BookModel.book,
				404: BookModel.notFoundError,
			},
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			set.status = 201;
			return BookService.create(body);
		},
		{
			body: BookModel.createBody,
			response: {
				201: BookModel.book,
				400: t.String(),
				409: BookModel.duplicateNameError,
			},
		},
	)
	.put(
		"/:id",
		async ({ params, body }) => {
			return BookService.update(params.id, body);
		},
		{
			params: t.Object({
				id: t.Numeric(),
			}),
			body: BookModel.updateBody,
			response: {
				200: BookModel.book,
				404: BookModel.notFoundError,
				409: BookModel.duplicateNameError,
			},
		},
	)
	.delete(
		"/:id",
		async ({ params }) => {
			return BookService.deleteBook(params.id);
		},
		{
			params: t.Object({
				id: t.Numeric(),
			}),
			response: {
				200: t.Object({ success: t.Boolean() }),
				404: BookModel.notFoundError,
			},
		},
	);
