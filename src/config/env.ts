function getEnvVar(name: string, required = true): string {
	const value = process.env[name];
	if (required && (!value || value.trim() === "")) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value || "";
}

function getPort(): number {
	const portStr = process.env.PORT || "3000";
	const port = Number.parseInt(portStr, 10);
	if (Number.isNaN(port) || port < 1 || port > 65535) {
		throw new Error(
			`Invalid PORT environment variable: ${portStr}. Must be a number between 1 and 65535.`,
		);
	}
	return port;
}

function getNodeEnv(): string {
	return getEnvVar("NODE_ENV", false) || "development";
}

export const env = {
	PORT: getPort(),
	DATABASE_URL: getEnvVar("DATABASE_URL", true),
	NODE_ENV: getNodeEnv(),
	STATIC_TOKEN: getEnvVar("STATIC_TOKEN", true),
};
