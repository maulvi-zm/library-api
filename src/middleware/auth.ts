import { Elysia, status, t } from "elysia";

export const auth = new Elysia({ name: "auth" })
	.guard({
		headers: t.Object({
			authorization: t.String(),
		}),
	})
	.onBeforeHandle({ as: "scoped" }, ({ headers }) => {
		const authorization = headers.authorization;

		if (!authorization) {
			return status(401, "Unauthorized: Missing Authorization header");
		}

		const [scheme, token] = authorization.split(" ");

		if (scheme !== "Bearer" || !token) {
			return status(401, "Unauthorized: Invalid Authorization header format");
		}

		const staticToken = process.env.STATIC_TOKEN;

		if (!staticToken || token !== staticToken) {
			return status(401, "Unauthorized: Invalid token");
		}
	});
