import type { PGlite } from "@electric-sql/pglite";

export let sharedPGlite: PGlite | null = null;

export function setSharedPGlite(instance: PGlite | null) {
	sharedPGlite = instance;
}

export function getSharedPGlite(): PGlite | null {
	return sharedPGlite;
}
