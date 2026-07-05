import type { Fixture } from "../schemas/index.js";
import type { GuardResult } from "../types/guard-result.js";

export function guardFixture(fixture: Fixture): GuardResult {
    const { fixtureId, status, sport, tournament } = fixture;

    if (!fixtureId || typeof fixtureId !== "string") {
        return { ok: false, reason: "Invalid or missing fixtureId" };
    }

    if (!status || typeof status !== "object") {
        return { ok: false, reason: "Invalid or missing status" };
    }

    if (
        !sport ||
        typeof sport !== "object" ||
        typeof sport.sportId !== "number"
    ) {
        return { ok: false, reason: "Invalid or missing sport" };
    }

    if (
        !tournament ||
        typeof tournament !== "object" ||
        typeof tournament.tournamentId !== "number"
    ) {
        return { ok: false, reason: "Invalid or missing tournament" };
    }

    if (typeof status.live !== "boolean") {
        return { ok: false, reason: "Invalid live status" };
    }

    // hard stop: fixture must have valid participants
    if (!fixture.participants) {
        return { ok: false, reason: "Missing participants" };
    }

    const p = fixture.participants;
    if (
        typeof p.participant1Id !== "number" ||
        typeof p.participant2Id !== "number" ||
        !p.participant1Name ||
        !p.participant2Name
    ) {
        return { ok: false, reason: "Invalid or incomplete participant data" };
    }

    return { ok: true };
}
