import type {
    Fixture,
    Bookmaker,
    BookmakersPayload,
    Odds,
    OddsPayload,
} from "./schemas/index.js";

type Versioned<T> = {
    ts: number;
    data: T;
};

export class State {
    private fixtures = new Map<string, Versioned<Fixture>>();

    private bookmakers = new Map<string, Map<string, Versioned<Bookmaker>>>();

    private odds = new Map<string, Map<string, Map<string, Versioned<Odds>>>>();

    applyFixture(payload: Fixture, ts: number) {
        const existing = this.fixtures.get(payload.fixtureId);

        if (existing && existing.ts >= ts) {
            return;
        }

        this.fixtures.set(payload.fixtureId, {
            ts,
            data: payload,
        });
    }

    applyBookmakers(payload: BookmakersPayload, ts: number) {
        if (!this.fixtures.has(payload.fixtureId)) {
            return;
        }

        let fixtureBookmakers = this.bookmakers.get(payload.fixtureId);

        if (!fixtureBookmakers) {
            fixtureBookmakers = new Map();
            this.bookmakers.set(payload.fixtureId, fixtureBookmakers);
        }

        for (const bookmaker of Object.values(payload.bookmakers)) {
            const existing = fixtureBookmakers.get(bookmaker.bookmaker);

            if (existing && existing.ts >= ts) {
                continue;
            }

            fixtureBookmakers.set(bookmaker.bookmaker, {
                ts,
                data: bookmaker,
            });

            if (
                bookmaker.staleOdds ||
                bookmaker.suspended ||
                !bookmaker.hasOdds
            ) {
                this.odds.get(payload.fixtureId)?.delete(bookmaker.bookmaker);
            }
        }
    }

    applyOdds(payload: OddsPayload, ts: number) {
        if (!this.fixtures.has(payload.fixtureId)) {
            return;
        }

        const fixtureBookmakers = this.bookmakers.get(payload.fixtureId);

        if (!fixtureBookmakers) {
            return;
        }

        let fixtureOdds = this.odds.get(payload.fixtureId);

        if (!fixtureOdds) {
            fixtureOdds = new Map();
            this.odds.set(payload.fixtureId, fixtureOdds);
        }

        for (const [bookmakerName, odds] of Object.entries(payload.odds)) {
            const bookmaker = fixtureBookmakers.get(bookmakerName);

            if (
                !bookmaker ||
                bookmaker.data.staleOdds ||
                bookmaker.data.suspended ||
                !bookmaker.data.hasOdds
            ) {
                continue;
            }

            let bookmakerOdds = fixtureOdds.get(bookmakerName);

            if (!bookmakerOdds) {
                bookmakerOdds = new Map();
                fixtureOdds.set(bookmakerName, bookmakerOdds);
            }

            for (const [oddsId, odd] of Object.entries(odds)) {
                const existing = bookmakerOdds.get(oddsId);

                if (existing && existing.data.changedAt >= odd.changedAt) {
                    continue;
                }

                if (!odd.active || odd.marketActive === false) {
                    bookmakerOdds.delete(oddsId);
                    continue;
                }

                bookmakerOdds.set(oddsId, {
                    ts,
                    data: odd,
                });
            }

            if (bookmakerOdds.size === 0) {
                fixtureOdds.delete(bookmakerName);
            }
        }

        if (fixtureOdds.size === 0) {
            this.odds.delete(payload.fixtureId);
        }
    }
}
