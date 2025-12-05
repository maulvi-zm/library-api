import { Elysia, status, t } from "elysia";

export const auth = new Elysia({ name: "auth" })
	.guard({
		headers: t.Object({
			authorization: t.String(),
		}),
	})
	.onRequest(({ request }) => {
		const authorization = request.headers.get("authorization");

		if (!authorization || typeof authorization !== "string") {
			throw status(401, "Unauthorized: Missing Authorization header");
		}

		const [scheme, token] = authorization.split(" ");

		if (scheme !== "Bearer" || !token) {
			throw status(401, "Unauthorized: Invalid Authorization header format");
		}

		const staticToken = process.env.STATIC_TOKEN;
		if (!staticToken || token !== staticToken) {
			throw status(401, "Unauthorized: Invalid token");
		}
	});
