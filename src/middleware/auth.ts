import { Elysia, t } from "elysia";
import { env } from "../config/env";

export const auth = new Elysia({ name: "auth" })
	.guard({
		headers: t.Object({
			authorization: t.String(),
		}),
	})
	.onBeforeHandle(({ headers, set }) => {
		const authorization = headers.authorization;

		const [scheme, token] = authorization.split(" ");

		if (scheme !== "Bearer" || !token) {
			set.status = 401;
			return { error: "Unauthorized: Invalid Authorization header format" };
		}

		if (token !== env.STATIC_TOKEN) {
			set.status = 401;
			return { error: "Unauthorized: Invalid token" };
		}
	});
