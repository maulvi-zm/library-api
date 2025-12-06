import { env } from "../config/env";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
	private shouldLog(level: LogLevel): boolean {
		if (env.NODE_ENV === "test") {
			return false;
		}

		if (env.NODE_ENV === "production") {
			return level === "warn" || level === "error";
		}

		// In development, log everything
		return true;
	}

	info(message: string, ...args: unknown[]): void {
		if (this.shouldLog("info")) {
			console.log(`[INFO] ${message}`, ...args);
		}
	}

	warn(message: string, ...args: unknown[]): void {
		if (this.shouldLog("warn")) {
			console.warn(`[WARN] ${message}`, ...args);
		}
	}

	error(message: string, ...args: unknown[]): void {
		if (this.shouldLog("error")) {
			console.error(`[ERROR] ${message}`, ...args);
		}
	}

	debug(message: string, ...args: unknown[]): void {
		if (this.shouldLog("debug")) {
			console.log(`[DEBUG] ${message}`, ...args);
		}
	}
}

export const logger = new Logger();
