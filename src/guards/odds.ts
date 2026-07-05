import type { Odds } from "../schemas/index.js";
import type { GuardResult } from "../types/guard-result.js";

export function guardOdds(odds: Odds): GuardResult {
    const { fixtureId, odds: bookmakerOdds } = odds;

    // validate fixtureId exists
    if (!fixtureId || typeof fixtureId !== "string") {
        return { ok: false, reason: "Invalid or missing fixtureId" };
    }

    // validate odds structure
    if (!bookmakerOdds || typeof bookmakerOdds !== "object") {
        return { ok: false, reason: "Invalid or missing odds object" };
    }

    // check each outcome for hard stops
    for (const [bookmakerKey, outcomes] of Object.entries(bookmakerOdds)) {
        if (!outcomes || typeof outcomes !== "object") {
            continue;
        }

        for (const [oddsId, outcome] of Object.entries(outcomes)) {
            // validate oddsId format: {fixtureId}:{bookmaker}:{outcomeId}:{playerId}
            const expectedOddsId = `${fixtureId}:${outcome.bookmaker}:${outcome.outcomeId}:${outcome.playerId}`;
            if (oddsId !== expectedOddsId) {
                return {
                    ok: false,
                    reason: `OddsId mismatch: expected ${expectedOddsId}, got ${oddsId}`,
                };
            }

            // hard stop: Check if outcome is inactive
            if (outcome.active === false) {
                return { ok: false, reason: `Outcome ${oddsId} is inactive` };
            }

            // hard stop: Check if market is inactive
            if (outcome.marketActive === false) {
                return {
                    ok: false,
                    reason: `Market for outcome ${oddsId} is inactive`,
                };
            }

            // validate required fields
            if (typeof outcome.price !== "number" || outcome.price <= 0) {
                return {
                    ok: false,
                    reason: `Invalid price for outcome ${oddsId}`,
                };
            }

            if (typeof outcome.marketId !== "number") {
                return {
                    ok: false,
                    reason: `Invalid marketId for outcome ${oddsId}`,
                };
            }

            if (typeof outcome.changedAt !== "number") {
                return {
                    ok: false,
                    reason: `Missing changedAt timestamp for outcome ${oddsId}`,
                };
            }
        }
    }

    return { ok: true };
}
