import type { Bookmaker } from "../schemas/index.js";
import type { GuardResult } from "../types/guard-result.js";

export function guardBookmaker(bookmaker: Bookmaker): GuardResult {
    const { fixtureId, bookmakers } = bookmaker;

    if (!fixtureId || typeof fixtureId !== "string") {
        return { ok: false, reason: "Invalid or missing fixtureId" };
    }

    if (!bookmakers || typeof bookmakers !== "object") {
        return { ok: false, reason: "Invalid or missing bookmakers object" };
    }

    for (const [bookmakerKey, bm] of Object.entries(bookmakers)) {
        if (!bm || typeof bm !== "object") {
            continue;
        }

        if (bm.staleOdds === true) {
            return {
                ok: false,
                reason: `Bookmaker ${bm.bookmaker} has stale odds for fixture ${fixtureId}`,
            };
        }

        if (bm.suspended === true) {
            return {
                ok: false,
                reason: `Bookmaker ${bm.bookmaker} is suspended for fixture ${fixtureId}`,
            };
        }

        if (typeof bm.bookmaker !== "string") {
            return {
                ok: false,
                reason: `Invalid bookmaker name for key ${bookmakerKey}`,
            };
        }

        if (typeof bm.hasOdds !== "boolean") {
            return {
                ok: false,
                reason: `Invalid hasOdds flag for bookmaker ${bm.bookmaker}`,
            };
        }

        if (typeof bm.updatedAt !== "string") {
            return {
                ok: false,
                reason: `Missing updatedAt for bookmaker ${bm.bookmaker}`,
            };
        }
    }

    return { ok: true };
}
